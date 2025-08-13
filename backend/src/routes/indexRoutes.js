import express from "express";

import userRoutes from "./userRoutes.js";
import employeeRoutes from "./employeeRoutes.js";
import orderRoutes from "./orderRoutes.js";
import drinkRoutes from "./drinkRoutes.js";
import menuItemRoutes from "./menuItemRoutes.js";
import paymentRoutes from './paymentRoutes.js'; 

const indexRoutes = express.Router();

indexRoutes.use("/users", userRoutes);
indexRoutes.use("/employees", employeeRoutes);
indexRoutes.use("/orders", orderRoutes);
indexRoutes.use("/drinks", drinkRoutes);
indexRoutes.use("/menu/items", menuItemRoutes);
indexRoutes.use("/payments", paymentRoutes);

export default indexRoutes;
