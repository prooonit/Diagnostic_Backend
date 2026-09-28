import { AppError } from "../utils/app-error.js";

const slugPattern = /^[a-z0-9-]+$/;

function requireObject(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new AppError(400, "Request body must be an object");
  }
}

function rejectUnexpectedFields(body, allowedFields) {
  const unexpectedField = Object.keys(body).find((field) => !allowedFields.includes(field));
  if (unexpectedField) {
    throw new AppError(400, `Unexpected field: ${unexpectedField}`);
  }
}

function requiredText(value, fieldName) {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError(400, `${fieldName} is required`);
  }

  return value.trim();
}

export function validateCenterCreation(body) {
  requireObject(body);
  rejectUnexpectedFields(body, ["name", "slug", "location"]);

  const slug = requiredText(body.slug, "Slug");
  if (slug !== slug.toLowerCase() || !slugPattern.test(slug)) {
    throw new AppError(400, "Slug must contain only lowercase letters, numbers, and hyphens");
  }

  return {
    name: requiredText(body.name, "Name"),
    slug,
    location: requiredText(body.location, "Location"),
  };
}

export function validateCenterUpdate(body) {
  requireObject(body);
  rejectUnexpectedFields(body, ["name", "location"]);

  if (!("name" in body) && !("location" in body)) {
    throw new AppError(400, "At least one of name or location is required");
  }

  const data = {};
  if ("name" in body) {
    data.name = requiredText(body.name, "Name");
  }
  if ("location" in body) {
    data.location = requiredText(body.location, "Location");
  }

  return data;
}

export function validateCenterStatus(body) {
  requireObject(body);
  rejectUnexpectedFields(body, ["isActive"]);

  if (typeof body.isActive !== "boolean") {
    throw new AppError(400, "isActive must be a boolean");
  }

  return { isActive: body.isActive };
}
