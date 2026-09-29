import { Router } from "express";
import { create, webhook } from "../controllers/payment.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/webhook", webhook);
router.post("/", authenticate, create);

export default router;
