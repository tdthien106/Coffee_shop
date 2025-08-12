import express from 'express';
import userRoutes from './userRoutes.js';

const indexRoutes = express.Router();

indexRoutes.use('/users', userRoutes);

export default indexRoutes;