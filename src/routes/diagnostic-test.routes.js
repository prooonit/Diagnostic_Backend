import { Router } from "express";
import {
  create,
  getById,
  list,
  update,
  updateStatus,
} from "../controllers/diagnostic-test.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  requireCenterRole,
  resolveActiveCenter,
} from "../middleware/center-authorization.middleware.js";

const router = Router({ mergeParams: true });

router.get("/", resolveActiveCenter, list);
router.get("/:testId", resolveActiveCenter, getById);
router.post("/", authenticate, requireCenterRole("OWNER"), create);
router.patch("/:testId", authenticate, requireCenterRole("OWNER"), update);
router.patch("/:testId/status", authenticate, requireCenterRole("OWNER"), updateStatus);

export default router;
