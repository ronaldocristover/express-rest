export interface PaymentMethodData {
  type: 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_ACCOUNT' | 'DIGITAL_WALLET' | 'OTHER';
  providerMethodId: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  brand?: string;
  metadata?: Record<string, any>;
}

export interface PaymentProviderConfig {
  apiKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  environment?: 'sandbox' | 'production';
  [key: string]: any;
}

export interface PaymentProviderResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  providerResponse?: any;
}

export interface StoredPaymentMethod {
  id: string;
  providerMethodId: string;
  type: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  brand?: string;
  metadata?: Record<string, any>;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export abstract class BasePaymentProvider {
  protected config: PaymentProviderConfig;
  protected providerName: string;

  constructor(providerName: string, config: PaymentProviderConfig) {
    this.providerName = providerName;
    this.config = config;
  }

  abstract storePaymentMethod(paymentMethodData: PaymentMethodData): Promise<PaymentProviderResponse<StoredPaymentMethod>>;
  abstract retrievePaymentMethod(providerMethodId: string): Promise<PaymentProviderResponse<StoredPaymentMethod>>;
  abstract deletePaymentMethod(providerMethodId: string): Promise<PaymentProviderResponse<boolean>>;
  abstract validatePaymentMethod(paymentMethodData: PaymentMethodData): Promise<PaymentProviderResponse<boolean>>;

  getName(): string {
    return this.providerName;
  }

  getConfig(): PaymentProviderConfig {
    return this.config;
  }

  updateConfig(newConfig: Partial<PaymentProviderConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  protected handleError(error: any, operation: string): PaymentProviderResponse {
    console.error(`Payment provider error (${this.providerName} - ${operation}):`, error);
    return {
      success: false,
      error: error.message || `Unknown error during ${operation}`
    };
  }

  protected logOperation(operation: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Payment provider operation (${this.providerName} - ${operation}):`, data);
    }
  }
}

export interface PaymentProviderFactory {
  createProvider(config: PaymentProviderConfig): BasePaymentProvider;
  getProviderName(): string;
  validateConfig(config: PaymentProviderConfig): boolean;
}