import paymentProviderRepository from '../repositories/payment-provider.repository';
import { cacheService } from './cache.service';
import { PaymentProvider, Prisma } from '@prisma/client';
import { logger } from '../config/logger.config';

class PaymentProviderService {
    async findAll(page: number = 1, pageSize: number = 10, activeOnly: boolean = false): Promise<{ contents: PaymentProvider[], total: number, page: number, pageSize: number, pages: number }> {
        // For now, bypass cache for paginated results to maintain consistency
        // In production, you could implement more sophisticated caching for paginated data
        return await paymentProviderRepository.findAll(page, pageSize, activeOnly);
    }

    async findOne(id: string): Promise<PaymentProvider | null> {
        // Try cache first
        const cachedProvider = await cacheService.getPaymentProvider(id);
        if (cachedProvider) {
            return cachedProvider;
        }

        // Cache miss - fetch from database
        const provider = await paymentProviderRepository.findById(id);

        if (provider) {
            // Cache the provider for 30 minutes
            await cacheService.cachePaymentProvider(id, provider, 1800);
            logger.debug('Payment provider cached', { id });
        }

        return provider;
    }

    async findByName(name: string): Promise<PaymentProvider | null> {
        return await paymentProviderRepository.findByName(name);
    }

    async findById(id: string): Promise<PaymentProvider | null> {
        return await this.findOne(id);
    }

    async create(providerData: Prisma.PaymentProviderCreateInput): Promise<PaymentProvider> {
        const provider = await paymentProviderRepository.create(providerData);

        // Invalidate payment providers cache
        await cacheService.invalidatePaymentProviders();
        logger.debug('Payment providers cache invalidated due to creation', { providerId: provider.id });

        return provider;
    }

    async update(id: string, providerData: Prisma.PaymentProviderUpdateInput): Promise<PaymentProvider> {
        const provider = await paymentProviderRepository.update(id, providerData);

        // Invalidate specific provider and general cache
        await cacheService.invalidatePaymentProvider(id);
        await cacheService.invalidatePaymentProviders();
        logger.debug('Payment provider cache invalidated due to update', { id });

        return provider;
    }

    async remove(id: string): Promise<PaymentProvider> {
        const provider = await paymentProviderRepository.delete(id);

        // Invalidate specific provider and general cache
        await cacheService.invalidatePaymentProvider(id);
        await cacheService.invalidatePaymentProviders();
        logger.debug('Payment provider cache invalidated due to deletion', { id });

        return provider;
    }

    async toggleActive(id: string): Promise<PaymentProvider> {
        const provider = await paymentProviderRepository.toggleActive(id);

        // Invalidate specific provider and general cache since active status changed
        await cacheService.invalidatePaymentProvider(id);
        await cacheService.invalidatePaymentProviders();
        logger.debug('Payment provider cache invalidated due to active status change', { id });

        return provider;
    }

    async getPaymentMethodsCount(providerId: string): Promise<number> {
        return await paymentProviderRepository.getPaymentMethodsCount(providerId);
    }

    async getActiveProviders(): Promise<PaymentProvider[]> {
        // Try cache first for active providers
        const cachedProviders = await cacheService.getPaymentProviders();
        if (cachedProviders) {
            return cachedProviders.filter((provider: PaymentProvider) => provider.isActive);
        }

        // Cache miss - fetch from database
        const providers = await paymentProviderRepository.getActiveProviders();

        // Cache all active providers for 30 minutes
        await cacheService.cachePaymentProviders(providers, 1800);
        logger.debug('Active payment providers cached', { count: providers.length });

        return providers;
    }
}

export const paymentProviderService = new PaymentProviderService();