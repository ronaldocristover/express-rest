import { Prisma } from '@prisma/client';

/**
 * Base repository class that provides standard CRUD operations.
 * This class should be extended by specific repository classes.
 */
export abstract class BaseRepository<T, CreateInput, UpdateInput, SelectInput = T> {
  protected model: any;

  constructor(model: any) {
    this.model = model;
  }

  /**
   * Find multiple records with pagination
   */
  async findAll(
    page: number = 1,
    pageSize: number = 10,
    options?: {
      where?: any;
      orderBy?: any;
      select?: any;
      include?: any;
    }
  ): Promise<{
    contents: SelectInput[];
    total: number;
    page: number;
    pageSize: number;
    pages: number;
  }> {
    const skip = (page - 1) * pageSize;

    const { where, orderBy, select, include } = options || {};

    const [contents, total] = await Promise.all([
      this.model.findMany({
        skip,
        take: pageSize,
        where,
        orderBy: orderBy || { createdAt: 'desc' as const },
        select,
        include
      }),
      this.model.count({ where })
    ]);

    const pages = Math.ceil(total / pageSize);

    return { contents, total, page, pageSize, pages };
  }

  /**
   * Find a single record by ID
   */
  async findById(
    id: string,
    options?: {
      select?: any;
      include?: any;
    }
  ): Promise<SelectInput | null> {
    const { select, include } = options || {};

    return await this.model.findUnique({
      where: { id },
      select,
      include
    });
  }

  /**
   * Find a single record by custom criteria
   */
  async findOne(
    where: any,
    options?: {
      select?: any;
      include?: any;
    }
  ): Promise<SelectInput | null> {
    const { select, include } = options || {};

    return await this.model.findFirst({
      where,
      select,
      include
    });
  }

  /**
   * Find a unique record by custom criteria
   */
  async findUnique(
    where: any,
    options?: {
      select?: any;
      include?: any;
    }
  ): Promise<SelectInput | null> {
    const { select, include } = options || {};

    return await this.model.findUnique({
      where,
      select,
      include
    });
  }

  /**
   * Find multiple records by criteria
   */
  async findMany(
    where: any,
    options?: {
      orderBy?: any;
      select?: any;
      include?: any;
      take?: number;
      skip?: number;
    }
  ): Promise<SelectInput[]> {
    const { orderBy, select, include, take, skip } = options || {};

    return await this.model.findMany({
      where,
      orderBy,
      select,
      include,
      take,
      skip
    });
  }

  /**
   * Create a new record
   */
  async create(
    data: CreateInput,
    options?: {
      select?: any;
      include?: any;
    }
  ): Promise<SelectInput> {
    const { select, include } = options || {};

    return await this.model.create({
      data,
      select,
      include
    });
  }

  /**
   * Update a record by ID
   */
  async update(
    id: string,
    data: UpdateInput,
    options?: {
      select?: any;
      include?: any;
    }
  ): Promise<SelectInput> {
    const { select, include } = options || {};

    return await this.model.update({
      where: { id },
      data,
      select,
      include
    });
  }

  /**
   * Update multiple records by criteria
   */
  async updateMany(
    where: any,
    data: UpdateInput
  ): Promise<{ count: number }> {
    return await this.model.updateMany({
      where,
      data
    });
  }

  /**
   * Delete a record by ID
   */
  async delete(
    id: string,
    options?: {
      select?: any;
      include?: any;
    }
  ): Promise<T> {
    const { select, include } = options || {};

    return await this.model.delete({
      where: { id },
      select,
      include
    });
  }

  /**
   * Delete multiple records by criteria
   */
  async deleteMany(where: any): Promise<{ count: number }> {
    return await this.model.deleteMany({
      where
    });
  }

  /**
   * Count records by criteria
   */
  async count(where?: any): Promise<number> {
    return await this.model.count({ where });
  }

  /**
   * Check if a record exists by criteria
   */
  async exists(where: any): Promise<boolean> {
    const count = await this.model.count({ where });
    return count > 0;
  }

  /**
   * Find or create a record (upsert by unique field)
   */
  async findOrCreate(
    where: any,
    create: CreateInput,
    options?: {
      select?: any;
      include?: any;
      update?: UpdateInput;
    }
  ): Promise<SelectInput> {
    const { select, include, update } = options || {};

    return await this.model.upsert({
      where,
      create,
      update: update || {},
      select,
      include
    });
  }

  /**
   * Create or update a record
   */
  async upsert(
    where: any,
    create: CreateInput,
    update: UpdateInput,
    options?: {
      select?: any;
      include?: any;
    }
  ): Promise<SelectInput> {
    const { select, include } = options || {};

    return await this.model.upsert({
      where,
      create,
      update,
      select,
      include
    });
  }

  /**
   * Aggregate data with the specified conditions
   */
  async aggregate(
    aggregate: any,
    where?: any
  ): Promise<any> {
    return await this.model.aggregate({
      where,
      ...aggregate
    });
  }

  /**
   * Group records by field
   */
  async groupBy(
    by: any,
    where?: any,
    options?: {
      _count?: any;
      _sum?: any;
      _avg?: any;
      _min?: any;
      _max?: any;
    }
  ): Promise<any> {
    return await this.model.groupBy({
      by,
      where,
      ...options
    });
  }
}