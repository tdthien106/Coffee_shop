import express from 'express';

import userRoutes from './userRoutes.js';
import employeeRoutes from './employeeRoutes.js';

const indexRoutes = express.Router();

indexRoutes.use('/', userRoutes);
indexRoutes.use('/', employeeRoutes);

export default indexRoutes;