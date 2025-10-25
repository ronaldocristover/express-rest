import { BasePaymentProvider, PaymentProviderConfig, PaymentProviderFactory } from '../interfaces/payment-provider.interface';
import { paymentProviderService } from './payment-provider.service';

class PaymentProviderManager {
  private providers: Map<string, BasePaymentProvider> = new Map();
  private factories: Map<string, PaymentProviderFactory> = new Map();

  registerFactory(name: string, factory: PaymentProviderFactory): void {
    this.factories.set(name.toLowerCase(), factory);
  }

  async initializeProvider(providerName: string): Promise<BasePaymentProvider | null> {
    const factory = this.factories.get(providerName.toLowerCase());
    if (!factory) {
      console.warn(`No factory registered for provider: ${providerName}`);
      return null;
    }

    try {
      // Get provider configuration from database
      const providerConfig = await paymentProviderService.findByName(providerName);
      if (!providerConfig || !providerConfig.isActive) {
        console.warn(`Provider ${providerName} not found or inactive`);
        return null;
      }

      const config = providerConfig.config as PaymentProviderConfig || {};
      
      // Validate configuration
      if (!factory.validateConfig(config)) {
        console.error(`Invalid configuration for provider: ${providerName}`);
        return null;
      }

      // Create provider instance
      const provider = factory.createProvider(config);
      this.providers.set(providerName.toLowerCase(), provider);
      
      return provider;
    } catch (error) {
      console.error(`Failed to initialize provider ${providerName}:`, error);
      return null;
    }
  }

  async getProvider(providerName: string): Promise<BasePaymentProvider | null> {
    const normalizedName = providerName.toLowerCase();
    
    // Return cached provider if available
    if (this.providers.has(normalizedName)) {
      return this.providers.get(normalizedName)!;
    }

    // Try to initialize the provider
    return await this.initializeProvider(providerName);
  }

  async getAllActiveProviders(): Promise<BasePaymentProvider[]> {
    const activeProviders = await paymentProviderService.getActiveProviders();
    const providers: BasePaymentProvider[] = [];

    for (const provider of activeProviders) {
      const providerInstance = await this.getProvider(provider.name);
      if (providerInstance) {
        providers.push(providerInstance);
      }
    }

    return providers;
  }

  refreshProvider(providerName: string): void {
    const normalizedName = providerName.toLowerCase();
    this.providers.delete(normalizedName);
  }

  refreshAllProviders(): void {
    this.providers.clear();
  }

  getRegisteredFactories(): string[] {
    return Array.from(this.factories.keys());
  }

  getActiveProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}

// Export singleton instance
export const paymentProviderManager = new PaymentProviderManager();