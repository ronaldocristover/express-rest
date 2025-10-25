import { Request, Response } from 'express';
import { paymentProviderService } from '../services/payment-provider.service';
import { logger } from '../config/logger.config';

class PaymentProviderController {
    async findAll(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.pageSize as string) || 10;
            const activeOnly = req.query.activeOnly === 'true';

            const result = await paymentProviderService.findAll(page, pageSize, activeOnly);

            return res.status(200).json({
                message: 'Payment providers retrieved successfully',
                data: result
            });
        } catch (error: any) {
            logger.error('Error in findAll', error);
            return res.status(500).json({
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    async find(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const provider = await paymentProviderService.findOne(id);
            if (!provider) {
                return res.status(404).json({
                    message: 'Payment provider not found'
                });
            }

            return res.status(200).json({
                message: 'Payment provider retrieved successfully',
                data: { provider }
            });
        } catch (error: any) {
            logger.error('Error in find', error);
            return res.status(500).json({
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const { name, displayName, isActive = true, config } = req.body;

            // Check if provider with this name already exists
            const existingProvider = await paymentProviderService.findByName(name);
            if (existingProvider) {
                return res.status(409).json({
                    message: 'Payment provider with this name already exists'
                });
            }

            const provider = await paymentProviderService.create({
                name,
                displayName,
                isActive,
                config
            });

            logger.info('Payment provider created', { providerId: provider.id, name: provider.name });

            return res.status(201).json({
                message: 'Payment provider created successfully',
                data: { provider }
            });
        } catch (error: any) {
            logger.error('Error in create', error);
            return res.status(500).json({
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { displayName, isActive, config } = req.body;

            // Check if provider exists
            const existingProvider = await paymentProviderService.findOne(id);
            if (!existingProvider) {
                return res.status(404).json({
                    message: 'Payment provider not found'
                });
            }

            const provider = await paymentProviderService.update(id, {
                displayName,
                isActive,
                config
            });

            logger.info('Payment provider updated', { providerId: id });

            return res.status(200).json({
                message: 'Payment provider updated successfully',
                data: { provider }
            });
        } catch (error: any) {
            logger.error('Error in update', error);
            return res.status(500).json({
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    async remove(req: Request, res: Response) {
        try {
            const { id } = req.params;

            // Check if provider exists
            const existingProvider = await paymentProviderService.findOne(id);
            if (!existingProvider) {
                return res.status(404).json({
                    message: 'Payment provider not found'
                });
            }

            // Check if provider has associated payment methods
            const paymentMethodsCount = await paymentProviderService.getPaymentMethodsCount(id);
            if (paymentMethodsCount > 0) {
                return res.status(400).json({
                    message: 'Cannot delete provider with associated payment methods'
                });
            }

            await paymentProviderService.remove(id);

            logger.info('Payment provider deleted', { providerId: id });

            return res.status(200).json({
                message: 'Payment provider deleted successfully',
                data: 'OK'
            });
        } catch (error: any) {
            logger.error('Error in remove', error);
            return res.status(500).json({
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Additional method for toggling active status
    async toggleActive(req: Request, res: Response) {
        try {
            const { id } = req.params;

            // Check if provider exists
            const existingProvider = await paymentProviderService.findOne(id);
            if (!existingProvider) {
                return res.status(404).json({
                    message: 'Payment provider not found'
                });
            }

            const provider = await paymentProviderService.toggleActive(id);

            logger.info('Payment provider status toggled', {
                providerId: id,
                isActive: provider.isActive
            });

            return res.status(200).json({
                message: `Payment provider ${provider.isActive ? 'activated' : 'deactivated'} successfully`,
                data: { provider }
            });
        } catch (error: any) {
            logger.error('Error in toggleActive', error);
            return res.status(500).json({
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Alias methods for route compatibility
    async getAll(req: Request, res: Response) {
        return this.findAll(req, res);
    }

    async getById(req: Request, res: Response) {
        return this.find(req, res);
    }

    async delete(req: Request, res: Response) {
        return this.remove(req, res);
    }
}

export default new PaymentProviderController();