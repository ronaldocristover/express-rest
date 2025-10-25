import { prisma } from '../config/database.config';
import { User, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

// Define a type for user response (excluding sensitive fields)
type UserResponse = Omit<User, 'password'>;

const publicUserSelect = {
  id: true,
  nama: true,
  telp: true,
  email: true,
  apiKey: true,
  createdAt: true,
  updatedAt: true
};

interface CreateUserData {
  nama: string;
  telp: string;
  email?: string;
}

interface UpdateUserData {
  nama?: string;
  telp?: string;
  email?: string;
}

class UserRepository extends BaseRepository<User, Prisma.UserCreateInput, Prisma.UserUpdateInput, UserResponse> {
  constructor() {
    super(prisma.user);
  }

  /**
   * Find all users with pagination
   */
  async findAll(page: number = 1, pageSize: number = 10): Promise<{
    contents: UserResponse[],
    total: number,
    page: number,
    pageSize: number,
    pages: number
  }> {
    return await super.findAll(page, pageSize, {
      select: publicUserSelect,
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<UserResponse | null> {
    return await super.findById(id, {
      select: publicUserSelect
    });
  }

  /**
   * Find user by telephone number
   */
  async findByTelp(telp: string): Promise<UserResponse | null> {
    return await super.findUnique({ telp }, {
      select: publicUserSelect
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<UserResponse | null> {
    if (!email) return null;
    return await super.findUnique({ email }, {
      select: publicUserSelect
    });
  }

  /**
   * Find user by API key
   */
  async findByApiKey(apiKey: string): Promise<UserResponse | null> {
    return await super.findUnique({ apiKey }, {
      select: publicUserSelect
    });
  }

  /**
   * Create user with custom data structure
   */
  async createUser(userData: CreateUserData): Promise<UserResponse> {
    const createData: Prisma.UserCreateInput = {
      nama: userData.nama,
      telp: userData.telp,
      email: userData.email || undefined
    };

    return await super.create(createData, {
      select: publicUserSelect
    });
  }

  /**
   * Update user with custom data structure
   */
  async updateUser(id: string, userData: UpdateUserData): Promise<UserResponse> {
    const updateData: Prisma.UserUpdateInput = {};

    if (userData.nama !== undefined) updateData.nama = userData.nama;
    if (userData.telp !== undefined) updateData.telp = userData.telp;
    if (userData.email !== undefined) updateData.email = userData.email || null;

    return await super.update(id, updateData, {
      select: publicUserSelect
    });
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<UserResponse> {
    return await prisma.user.delete({
      where: { id },
      select: publicUserSelect
    });
  }

  /**
   * Check if user exists by telephone
   */
  async telpExists(telp: string): Promise<boolean> {
    return await this.exists({ telp });
  }

  /**
   * Check if user exists by email
   */
  async emailExists(email: string): Promise<boolean> {
    if (!email) return false;
    return await this.exists({ email });
  }

  /**
   * Find users by name search
   */
  async findByNama(nama: string, page: number = 1, pageSize: number = 10): Promise<{
    contents: UserResponse[],
    total: number,
    page: number,
    pageSize: number,
    pages: number
  }> {
    return await super.findAll(page, pageSize, {
      where: {
        nama: {
          contains: nama,
          mode: 'insensitive'
        }
      },
      select: publicUserSelect,
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Search users by nama or telp
   */
  async search(query: string, page: number = 1, pageSize: number = 10): Promise<{
    contents: UserResponse[],
    total: number,
    page: number,
    pageSize: number,
    pages: number
  }> {
    return await super.findAll(page, pageSize, {
      where: {
        OR: [
          {
            nama: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            telp: {
              contains: query
            }
          },
          {
            email: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
      },
      select: publicUserSelect,
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get user count
   */
  async getUserCount(): Promise<number> {
    return await this.count();
  }
}

export default new UserRepository();