import { Router } from 'express';
import { userRoutes } from './user.route';
import { paymentMethodRoutes } from './payment-method.route';
import { paymentProviderRoutes } from './payment-provider.route';

const router = Router();

// Mount route modules
router.use('/users', userRoutes);
router.use('/payment-methods', paymentMethodRoutes);
router.use('/payment-providers', paymentProviderRoutes);

export default router;