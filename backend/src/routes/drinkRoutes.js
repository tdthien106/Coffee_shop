// routes/drinkRoutes.js
import express from 'express';
import DrinkController from '../controllers/drinkController.js';

const router = express.Router();
router.post('/', DrinkController.create);
router.get('/', DrinkController.getAll);
router.get('/:id', DrinkController.getById);
router.put('/:id', DrinkController.update);
router.delete('/:id', DrinkController.delete);
export default router;