import { prisma } from '../config/database.config';
import { PaymentProvider, Prisma } from '@prisma/client';

class PaymentProviderRepository {
  private model;

  constructor() {
    this.model = prisma.paymentProvider;
  }

  async findAll(page: number = 1, pageSize: number = 10, activeOnly: boolean = false): Promise<{ contents: PaymentProvider[], total: number, page: number, pageSize: number, pages: number }> {
    const skip = (page - 1) * pageSize;
    const where = activeOnly ? { isActive: true } : {};

    const [contents, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      this.model.count({ where })
    ]);

    const pages = Math.ceil(total / pageSize);

    return { contents, total, page, pageSize, pages };
  }

  async findById(id: string): Promise<PaymentProvider | null> {
    return await this.model.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        displayName: true,
        isActive: true,
        config: true,
        createdAt: true,
        updatedAt: true,
        // Only include active payment methods count, not full list to avoid N+1
        _count: {
          select: {
            paymentMethods: {
              where: { isActive: true }
            }
          }
        }
      }
    });
  }

  async findByName(name: string): Promise<PaymentProvider | null> {
    return await this.model.findUnique({
      where: { name }
    });
  }

  async create(providerData: Prisma.PaymentProviderCreateInput): Promise<PaymentProvider> {
    return await this.model.create({
      data: providerData
    });
  }

  async update(id: string, providerData: Prisma.PaymentProviderUpdateInput): Promise<PaymentProvider> {
    return await this.model.update({
      where: { id },
      data: providerData
    });
  }

  async delete(id: string): Promise<PaymentProvider> {
    return await this.model.delete({
      where: { id }
    });
  }

  async toggleActive(id: string): Promise<PaymentProvider> {
    const provider = await this.model.findUnique({
      where: { id }
    });

    if (!provider) {
      throw new Error('Payment provider not found');
    }

    return await this.model.update({
      where: { id },
      data: {
        isActive: !provider.isActive
      }
    });
  }

  async getPaymentMethodsCount(providerId: string): Promise<number> {
    return await prisma.paymentMethod.count({
      where: {
        providerId
      }
    });
  }

  async getActiveProviders(): Promise<PaymentProvider[]> {
    return await this.model.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    });
  }
}

export default new PaymentProviderRepository();