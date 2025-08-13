import { Router } from 'express';
import OrderController from '../controllers/orderController.js';

const orderRoutes = Router();

orderRoutes.post('/', OrderController.create);
orderRoutes.post('/:orderId/items', OrderController.addItem);
orderRoutes.get('/:orderId', OrderController.getOrder);

export default orderRoutes;