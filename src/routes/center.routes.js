import { Router } from "express";
import {
  create,
  getBySlug,
  list,
  update,
  updateStatus,
} from "../controllers/center.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireCenterRole } from "../middleware/center-authorization.middleware.js";
import diagnosticTestRouter from "./diagnostic-test.routes.js";

const router = Router();

router.get("/", list);
router.use("/:slug/tests", diagnosticTestRouter);
router.get("/:slug", getBySlug);
router.post("/", authenticate, create);
router.patch("/:slug", authenticate, requireCenterRole("OWNER"), update);
router.patch("/:slug/status", authenticate, requireCenterRole("OWNER"), updateStatus);

export default router;
