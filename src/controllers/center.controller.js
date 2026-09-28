import {
  createCenter,
  getActiveCenterBySlug,
  listActiveCenters,
  updateCenter,
  updateCenterStatus,
} from "../services/center.service.js";
import {
  validateCenterCreation,
  validateCenterStatus,
  validateCenterUpdate,
} from "../validators/center.validator.js";

export async function create(req, res, next) {
  try {
    const center = await createCenter({
      ...validateCenterCreation(req.body),
      userId: req.user.id,
    });
    return res.status(201).json(center);
  } catch (error) {
    return next(error);
  }
}

export async function list(req, res, next) {
  try {
    const centers = await listActiveCenters();
    return res.status(200).json({ centers });
  } catch (error) {
    return next(error);
  }
}

export async function getBySlug(req, res, next) {
  try {
    const center = await getActiveCenterBySlug(req.params.slug);
    return res.status(200).json({ center });
  } catch (error) {
    return next(error);
  }
}

export async function update(req, res, next) {
  try {
    const center = await updateCenter(req.center.id, validateCenterUpdate(req.body));
    return res.status(200).json({ center });
  } catch (error) {
    return next(error);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const center = await updateCenterStatus(
      req.center.id,
      validateCenterStatus(req.body).isActive,
    );
    return res.status(200).json({ center });
  } catch (error) {
    return next(error);
  }
}
