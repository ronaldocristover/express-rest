import { prisma } from '../config/database.config';
import { PaymentMethod, Prisma, PaymentMethodType } from '@prisma/client';
import { BaseRepository } from './base.repository';

const paymentMethodInclude = {
  user: {
    select: {
      id: true,
      email: true,
      name: true
    }
  },
  provider: {
    select: {
      id: true,
      name: true,
      displayName: true
    }
  }
};

const providerOnlyInclude = {
  provider: {
    select: {
      id: true,
      name: true,
      displayName: true
    }
  }
};

class PaymentMethodRepository extends BaseRepository<PaymentMethod, Prisma.PaymentMethodCreateInput, Prisma.PaymentMethodUpdateInput> {
  constructor() {
    super(prisma.paymentMethod);
  }

  /**
   * Find all payment methods with full relations
   */
  async findAll(page: number = 1, pageSize: number = 10): Promise<{ contents: PaymentMethod[], total: number, page: number, pageSize: number, pages: number }> {
    return await super.findAll(page, pageSize, {
      include: paymentMethodInclude
    });
  }

  /**
   * Find payment method by ID with full relations
   */
  async findById(id: string): Promise<PaymentMethod | null> {
    return await super.findById(id, {
      include: paymentMethodInclude
    });
  }

  /**
   * Find payment method by ID for specific user
   */
  async findByIdForUser(id: string, userId: string): Promise<PaymentMethod | null> {
    return await super.findOne(
      { id, userId },
      { include: providerOnlyInclude }
    );
  }

  /**
   * Find payment method by provider method ID and user
   */
  async findByProviderMethodId(providerMethodId: string, userId: string): Promise<PaymentMethod | null> {
    return await super.findOne({ providerMethodId, userId });
  }

  /**
   * Find all payment methods for a specific user with filtering
   */
  async findAllForUser(
    userId: string,
    page: number = 1,
    pageSize: number = 10,
    type?: string,
    activeOnly: boolean = false,
    providerId?: string
  ): Promise<{ contents: PaymentMethod[], total: number, page: number, pageSize: number, pages: number }> {
    const where: Prisma.PaymentMethodWhereInput = {
      userId,
      ...(type && { type: type as PaymentMethodType }),
      ...(activeOnly && { isActive: true }),
      ...(providerId && { providerId })
    };

    return await super.findAll(page, pageSize, {
      where,
      include: providerOnlyInclude,
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  /**
   * Create payment method with provider relation
   */
  async create(paymentMethodData: Prisma.PaymentMethodCreateInput): Promise<PaymentMethod> {
    return await super.create(paymentMethodData, {
      include: providerOnlyInclude
    });
  }

  /**
   * Update payment method with provider relation
   */
  async update(id: string, paymentMethodData: Prisma.PaymentMethodUpdateInput): Promise<PaymentMethod> {
    return await super.update(id, paymentMethodData, {
      include: providerOnlyInclude
    });
  }

  /**
   * Delete payment method
   */
  async delete(id: string): Promise<PaymentMethod> {
    return await super.delete(id);
  }

  /**
   * Set payment method as default
   */
  async setDefault(id: string): Promise<PaymentMethod> {
    return await this.update(id, { isDefault: true });
  }

  /**
   * Unset all default payment methods for a user
   */
  async unsetDefaultForUser(userId: string): Promise<void> {
    await this.updateMany(
      { userId, isDefault: true },
      { isDefault: false }
    );
  }

  /**
   * Deactivate payment method and remove default status
   */
  async deactivate(id: string): Promise<PaymentMethod> {
    return await this.update(id, {
      isActive: false,
      isDefault: false
    });
  }

  /**
   * Get default payment method for user
   */
  async getDefaultForUser(userId: string): Promise<PaymentMethod | null> {
    return await super.findOne(
      { userId, isDefault: true, isActive: true },
      { include: providerOnlyInclude }
    );
  }

  /**
   * Get all active payment methods for user
   */
  async getActiveForUser(userId: string): Promise<PaymentMethod[]> {
    return await this.findMany(
      { userId, isActive: true },
      {
        include: providerOnlyInclude,
        orderBy: [
          { isDefault: 'desc' },
          { createdAt: 'desc' }
        ]
      }
    );
  }

  /**
   * Check if payment method exists for user
   */
  async existsForUser(id: string, userId: string): Promise<boolean> {
    return await this.exists({ id, userId });
  }

  /**
   * Count payment methods for user
   */
  async countForUser(userId: string, activeOnly: boolean = false): Promise<number> {
    return await this.count({
      userId,
      ...(activeOnly && { isActive: true })
    });
  }

  /**
   * Find payment methods by type for user
   */
  async findByTypeForUser(
    userId: string,
    type: PaymentMethodType,
    activeOnly: boolean = false
  ): Promise<PaymentMethod[]> {
    return await this.findMany(
      {
        userId,
        type,
        ...(activeOnly && { isActive: true })
      },
      {
        include: providerOnlyInclude,
        orderBy: [
          { isDefault: 'desc' },
          { createdAt: 'desc' }
        ]
      }
    );
  }
}

export default new PaymentMethodRepository();