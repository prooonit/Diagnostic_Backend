import { Router } from "express";
import { cancel, create, getById, list } from "../controllers/booking.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.post("/", create);
router.get("/", list);
router.patch("/:id/cancel", cancel);
router.get("/:id", getById);

export default router;
