// routes/checkoutRoutes.js
import { Router } from "express";
import CheckoutController from "../controllers/checkoutController.js";
// import { requireLogin } from "../middleware/authMiddleware.js";

const r = Router();
r.post("/", /*requireLogin,*/ CheckoutController.checkout);
export default r;
