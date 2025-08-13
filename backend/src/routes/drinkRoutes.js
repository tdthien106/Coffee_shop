// routes/drinkRoutes.js
import express from 'express';
import DrinkController from '../controllers/drinkController.js';

const drinkRoutes = express.Router();
drinkRoutes.post('/', DrinkController.create);
drinkRoutes.get('/', DrinkController.getAll);
drinkRoutes.get('/:id', DrinkController.getById);
drinkRoutes.put('/:id', DrinkController.update);
drinkRoutes.delete('/:id', DrinkController.delete);
export default drinkRoutes;