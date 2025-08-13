// routes/paymentRoutes.js
import express from "express";
import PaymentController from "../controllers/paymentController.js";
import { validateProcessPayment } from "../middleware/paymentMiddleware.js";

const paymentRoutes = express.Router();

paymentRoutes.post("/", validateProcessPayment, PaymentController.process);
paymentRoutes.get("/:orderId", PaymentController.getByOrderId);

export default paymentRoutes;
