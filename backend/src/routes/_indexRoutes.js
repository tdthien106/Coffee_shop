import express from "express";

import userRoutes from "./userRoutes.js";
import employeeRoutes from "./employeeRoutes.js";
import orderRoutes from "./orderRoutes.js";
import drinkRoutes from "./drinkRoutes.js";
import menuItemRoutes from "./menuItemRoutes.js";
import paymentRoutes from './paymentRoutes.js';
import authRoutes from './authRoutes.js';
import homeRoutes from "./homeRoutes.js";
import exportRoutes from "./exportRoutes.js";
import shiftRoutes from "./shiftRoutes.js";

import checkoutRoutes from "./checkoutRoutes.js";

const indexRoutes = express.Router();
indexRoutes.use('/auth', authRoutes);

indexRoutes.use("/users", userRoutes);
indexRoutes.use("/employees", employeeRoutes);
indexRoutes.use("/orders", orderRoutes);
indexRoutes.use("/drinks", drinkRoutes);
indexRoutes.use("/menu/items", menuItemRoutes);
indexRoutes.use("/payments", paymentRoutes);
indexRoutes.use("/exports", exportRoutes);
indexRoutes.use("/checkout", checkoutRoutes);
indexRoutes.use("/home", homeRoutes)
indexRoutes.use("/shifts", shiftRoutes)

export default indexRoutes;
