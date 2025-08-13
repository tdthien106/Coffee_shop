// routes/menuItemRoutes.js
import express from "express";
import MenuItemController from "../controllers/menuItemController.js";
import {
  validateCreateMenuItem,
  validateUpdateMenuItem,
} from "../middleware/menuItemMiddleware.js";

const router = express.Router();
router.post("/", validateCreateMenuItem, MenuItemController.create);
router.get("/", MenuItemController.getAll); // ?withDrink=1 để join Drink
router.get("/:id", MenuItemController.getById);
router.put("/:id", validateUpdateMenuItem, MenuItemController.update);
router.delete("/:id", MenuItemController.delete);

export default router;