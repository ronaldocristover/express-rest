import { Router } from 'express';
import { paymentMethodController } from '../controllers/payment-method.controller';
import { validate, validateParams, validateQuery } from '../middlewares/validation.middleware';
import { paymentMethodSchemas } from '../validators/payment-method-validator';

export const paymentMethodRoutes = Router();

// Get all payment methods for the authenticated user
paymentMethodRoutes.get('/', validateQuery(paymentMethodSchemas.query), paymentMethodController.getAll);

// Get payment method by ID
paymentMethodRoutes.get('/:id', validateParams(paymentMethodSchemas.params), paymentMethodController.getById);

// Create new payment method
paymentMethodRoutes.post('/', validate(paymentMethodSchemas.create), paymentMethodController.create);

// Update payment method
paymentMethodRoutes.put('/:id', validateParams(paymentMethodSchemas.params), validate(paymentMethodSchemas.update), paymentMethodController.update);

// Delete payment method
paymentMethodRoutes.delete('/:id', validateParams(paymentMethodSchemas.params), paymentMethodController.delete);

// Set payment method as default
paymentMethodRoutes.patch('/:id/set-default', validateParams(paymentMethodSchemas.params), paymentMethodController.setDefault);

// Deactivate payment method
paymentMethodRoutes.patch('/:id/deactivate', validateParams(paymentMethodSchemas.params), paymentMethodController.deactivate);