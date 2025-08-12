import userController from "../controllers/userController.js";

import { Router } from "express";  

const userRoutes = Router();

userRoutes.get('/users', userController.getAllUsers);
userRoutes.get('/users/:id', userController.getUserById);
userRoutes.post('/users', userController.createUser);
userRoutes.put('/users/:id', userController.updateUser);
userRoutes.delete('/users/:id', userController.deleteUser);

export default userRoutes;