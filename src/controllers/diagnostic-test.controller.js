import {
  createDiagnosticTest,
  getActiveDiagnosticTest,
  listActiveDiagnosticTests,
  updateDiagnosticTest,
  updateDiagnosticTestStatus,
} from "../services/diagnostic-test.service.js";
import {
  validateTestCreation,
  validateTestStatus,
  validateTestUpdate,
} from "../validators/diagnostic-test.validator.js";

export async function create(req, res, next) {
  try {
    const test = await createDiagnosticTest(req.center.id, validateTestCreation(req.body));
    return res.status(201).json({ test });
  } catch (error) {
    return next(error);
  }
}

export async function list(req, res, next) {
  try {
    const tests = await listActiveDiagnosticTests(req.center.id);
    return res.status(200).json({ tests });
  } catch (error) {
    return next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const test = await getActiveDiagnosticTest(req.center.id, req.params.testId);
    return res.status(200).json({ test });
  } catch (error) {
    return next(error);
  }
}

export async function update(req, res, next) {
  try {
    const test = await updateDiagnosticTest(
      req.center.id,
      req.params.testId,
      validateTestUpdate(req.body),
    );
    return res.status(200).json({ test });
  } catch (error) {
    return next(error);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const test = await updateDiagnosticTestStatus(
      req.center.id,
      req.params.testId,
      validateTestStatus(req.body).isActive,
    );
    return res.status(200).json({ test });
  } catch (error) {
    return next(error);
  }
}
