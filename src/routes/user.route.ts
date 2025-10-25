import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { validate } from '../middlewares/validation.middleware';

export const userRoutes = Router();

// Get all users with optional search
userRoutes.get('/', userController.getUsers);

// Get user by ID
userRoutes.get('/:id', userController.getUserById);

// Get user by telephone number
userRoutes.get('/telp/:telp', userController.getUserByTelp);

// Create new user
userRoutes.post('/', userController.createUser);

// Update user
userRoutes.put('/:id', userController.updateUser);

// Delete user
userRoutes.delete('/:id', userController.deleteUser);