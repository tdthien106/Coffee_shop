// routes/paymentRoutes.js
import express from "express";
import PaymentController from "../controllers/paymentController.js";
import { validateProcessPayment } from "../middleware/paymentMiddleware.js";

const router = express.Router();

router.post("/", validateProcessPayment, PaymentController.process);
router.get("/:orderId", PaymentController.getByOrderId);

export default router;
