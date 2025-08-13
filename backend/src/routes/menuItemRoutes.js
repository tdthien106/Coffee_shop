// routes/menuItemRoutes.js
import express from "express";
import MenuItemController from "../controllers/menuItemController.js";
import {
  validateCreateMenuItem,
  validateUpdateMenuItem,
} from "../middleware/menuItemMiddleware.js";

const menuRoutes = express.Router();
menuRoutes.post("/", validateCreateMenuItem, MenuItemController.create);
menuRoutes.get("/", MenuItemController.getAll); // ?withDrink=1 để join Drink
menuRoutes.get("/:id", MenuItemController.getById);
menuRoutes.put("/:id", validateUpdateMenuItem, MenuItemController.update);
menuRoutes.delete("/:id", MenuItemController.delete);

export default menuRoutes;