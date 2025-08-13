import userController from "../controllers/userController.js";

import { Router } from "express";  

const userRoutes = Router();

userRoutes.get('/', userController.getAllUsers);
userRoutes.get('/:id', userController.getUserById);
userRoutes.post('/', userController.createUser);
userRoutes.put('/:id', userController.updateUser);
userRoutes.delete('/:id', userController.deleteUser);

export default userRoutes;