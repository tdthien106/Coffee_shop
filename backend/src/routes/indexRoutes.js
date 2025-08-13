import express from 'express';

import userRoutes from './userRoutes.js';
import employeeRoutes from './employeeRoutes.js';
import orderRoutes from './orderRoutes.js'

const indexRoutes = express.Router();

indexRoutes.use('/users', userRoutes);
indexRoutes.use('/employees', employeeRoutes);
indexRoutes.use('/orders', orderRoutes);

export default indexRoutes;