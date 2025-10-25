import paymentMethodRepository from '../repositories/payment-method.repository';
import { PaymentMethod, Prisma, PaymentMethodType } from '@prisma/client';

class PaymentMethodService {
  async findAll(page: number = 1, pageSize: number = 10): Promise<{ contents: PaymentMethod[], total: number, page: number, pageSize: number, pages: number }> {
    return await paymentMethodRepository.findAll(page, pageSize);
  }

  async findOne(id: string): Promise<PaymentMethod | null> {
    return await paymentMethodRepository.findById(id);
  }

  async findOneForUser(id: string, userId: string): Promise<PaymentMethod | null> {
    return await paymentMethodRepository.findByIdForUser(id, userId);
  }

  async findByIdForUser(id: string, userId: string): Promise<PaymentMethod | null> {
    return await this.findOneForUser(id, userId);
  }

  async findByProviderMethodId(providerMethodId: string, userId: string): Promise<PaymentMethod | null> {
    return await paymentMethodRepository.findByProviderMethodId(providerMethodId, userId);
  }

  async findAllForUser(
    userId: string,
    page: number = 1,
    pageSize: number = 10,
    type?: string,
    activeOnly: boolean = false,
    providerId?: string
  ): Promise<{ contents: PaymentMethod[], total: number, page: number, pageSize: number, pages: number }> {
    return await paymentMethodRepository.findAllForUser(
      userId,
      page,
      pageSize,
      type,
      activeOnly,
      providerId
    );
  }

  async getAllForUser(
    userId: string,
    page: number = 1,
    pageSize: number = 10,
    type?: string,
    activeOnly: boolean = false,
    providerId?: string
  ): Promise<{ contents: PaymentMethod[], total: number, page: number, pageSize: number, pages: number }> {
    return await this.findAllForUser(userId, page, pageSize, type, activeOnly, providerId);
  }

  async create(paymentMethodData: Prisma.PaymentMethodCreateInput): Promise<PaymentMethod> {
    return await paymentMethodRepository.create(paymentMethodData);
  }

  async update(id: string, paymentMethodData: Prisma.PaymentMethodUpdateInput): Promise<PaymentMethod> {
    return await paymentMethodRepository.update(id, paymentMethodData);
  }

  async remove(id: string): Promise<PaymentMethod> {
    return await paymentMethodRepository.delete(id);
  }

  async delete(id: string): Promise<PaymentMethod> {
    return await this.remove(id);
  }

  async setDefault(id: string): Promise<PaymentMethod> {
    return await paymentMethodRepository.setDefault(id);
  }

  async unsetDefaultForUser(userId: string): Promise<void> {
    return await paymentMethodRepository.unsetDefaultForUser(userId);
  }

  async deactivate(id: string): Promise<PaymentMethod> {
    return await paymentMethodRepository.deactivate(id);
  }

  async getDefaultForUser(userId: string): Promise<PaymentMethod | null> {
    return await paymentMethodRepository.getDefaultForUser(userId);
  }

  async getActiveForUser(userId: string): Promise<PaymentMethod[]> {
    return await paymentMethodRepository.getActiveForUser(userId);
  }
}

export const paymentMethodService = new PaymentMethodService();