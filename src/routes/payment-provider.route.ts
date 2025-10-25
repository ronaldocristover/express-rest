import { Router } from 'express';
import paymentProviderController from '../controllers/payment-provider.controller';
import { validate, validateParams } from '../middlewares/validation.middleware';
import { paymentProviderSchemas } from '../validators/payment-provider-validator';

export const paymentProviderRoutes = Router();

// Get all payment providers
paymentProviderRoutes.get('/', paymentProviderController.getAll);

// Get payment provider by ID
paymentProviderRoutes.get('/:id', validateParams(paymentProviderSchemas.params), paymentProviderController.getById);

// Create new payment provider (admin only)
paymentProviderRoutes.post('/', validate(paymentProviderSchemas.create), paymentProviderController.create);

// Update payment provider (admin only)
paymentProviderRoutes.put('/:id', validateParams(paymentProviderSchemas.params), validate(paymentProviderSchemas.update), paymentProviderController.update);

// Delete payment provider (admin only)
paymentProviderRoutes.delete('/:id', validateParams(paymentProviderSchemas.params), paymentProviderController.delete);

// Toggle provider active status (admin only)
paymentProviderRoutes.patch('/:id/toggle', validateParams(paymentProviderSchemas.params), paymentProviderController.toggleActive);