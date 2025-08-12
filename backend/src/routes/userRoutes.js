// routes/userRoutes.js
import express from 'express';
import UserController from '../controllers/userController.js';
import { validateUser, validateUserUpdate } from '../middlewares/userMiddleware.js';

const router = express.Router();

router.post('/', validateUser, UserController.createUser);
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.put('/:id', validateUserUpdate, UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

export default router;