import userRepository from '../repositories/user.repository';
import { cacheService } from './cache.service';
import { logger } from '../config/logger.config';

// Define interfaces for user data
interface UserResponse {
  id: string;
  nama: string;
  telp: string;
  email: string | null;
  apiKey: string | null;
  createdAt: Date;
  updatedAt: Date;
}

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

class UserService {
  async findAll(page: number = 1, pageSize: number = 10): Promise<{
    contents: UserResponse[],
    total: number,
    page: number,
    pageSize: number,
    pages: number
  }> {
    logger.info('Finding all users', { page, pageSize });
    return await userRepository.findAll(page, pageSize);
  }

  async findOne(id: string): Promise<UserResponse | null> {
    logger.info('Finding user by id', { id });

    // Try cache first
    const cachedUser = await cacheService.getUserByApiKey(`user_${id}`);
    if (cachedUser) {
      return cachedUser as UserResponse;
    }

    const user = await userRepository.findById(id);

    if (user) {
      // Cache the user for 30 minutes
      await cacheService.cacheUserByApiKey(`user_${id}`, user, 1800);
    }

    return user;
  }

  async findByTelp(telp: string): Promise<UserResponse | null> {
    logger.info('Finding user by telp', { telp });
    return await userRepository.findByTelp(telp);
  }

  async findByEmail(email: string): Promise<UserResponse | null> {
    if (!email) return null;
    logger.info('Finding user by email', { email });
    return await userRepository.findByEmail(email);
  }

  async create(userData: CreateUserData): Promise<UserResponse> {
    logger.info('Creating new user', { nama: userData.nama, telp: userData.telp });

    // Check if user with same telp already exists
    const existingUserByTelp = await this.findByTelp(userData.telp);
    if (existingUserByTelp) {
      throw new Error('User dengan nomor telepon ini sudah terdaftar');
    }

    // Check if user with same email already exists (if email provided)
    if (userData.email) {
      const existingUserByEmail = await this.findByEmail(userData.email);
      if (existingUserByEmail) {
        throw new Error('User dengan email ini sudah terdaftar');
      }
    }

    const user = await userRepository.createUser(userData);
    logger.info('User created successfully', { id: user.id, nama: user.nama });

    return user;
  }

  async update(id: string, userData: UpdateUserData): Promise<UserResponse> {
    logger.info('Updating user', { id, ...userData });

    // Check if user exists
    const existingUser = await this.findOne(id);
    if (!existingUser) {
      throw new Error('User tidak ditemukan');
    }

    // Check if telp is being updated and if it's already taken by another user
    if (userData.telp && userData.telp !== existingUser.telp) {
      const userWithSameTelp = await this.findByTelp(userData.telp);
      if (userWithSameTelp && userWithSameTelp.id !== id) {
        throw new Error('Nomor telepon sudah digunakan oleh user lain');
      }
    }

    // Check if email is being updated and if it's already taken by another user
    if (userData.email && userData.email !== existingUser.email) {
      const userWithSameEmail = await this.findByEmail(userData.email);
      if (userWithSameEmail && userWithSameEmail.id !== id) {
        throw new Error('Email sudah digunakan oleh user lain');
      }
    }

    const user = await userRepository.updateUser(id, userData);

    // Invalidate cache
    await cacheService.invalidateUserByApiKey(`user_${id}`);

    logger.info('User updated successfully', { id });
    return user;
  }

  async remove(id: string): Promise<UserResponse> {
    logger.info('Deleting user', { id });

    // Check if user exists
    const existingUser = await this.findOne(id);
    if (!existingUser) {
      throw new Error('User tidak ditemukan');
    }

    const deletedUser = await userRepository.deleteUser(id);

    // Invalidate cache
    await cacheService.invalidateUserByApiKey(`user_${id}`);

    logger.info('User deleted successfully', { id });
    return deletedUser;
  }

  async search(query: string, page: number = 1, pageSize: number = 10): Promise<{
    contents: UserResponse[],
    total: number,
    page: number,
    pageSize: number,
    pages: number
  }> {
    logger.info('Searching users', { query, page, pageSize });
    return await userRepository.search(query, page, pageSize);
  }

  async findByApiKey(apiKey: string): Promise<UserResponse | null> {
    logger.info('Finding user by API key', { apiKey: apiKey.substring(0, 8) + '...' });
    return await userRepository.findByApiKey(apiKey);
  }
}

export const userService = new UserService();