import { AppError } from "../utils/app-error.js";

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

function requiredName(value) {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError(400, "Name is required");
  }

  return value.trim();
}

function optionalDescription(value) {
  if (typeof value !== "string") {
    throw new AppError(400, "Description must be a string");
  }

  return value.trim();
}

function monetaryPrice(value) {
  if ((typeof value !== "number" && typeof value !== "string") || value === "") {
    throw new AppError(400, "Price must be a non-negative monetary value");
  }

  if (typeof value === "number" && !Number.isFinite(value)) {
    throw new AppError(400, "Price must be a non-negative monetary value");
  }

  const normalizedPrice = String(value);
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalizedPrice)) {
    throw new AppError(400, "Price must be a non-negative monetary value");
  }

  return normalizedPrice;
}

export function validateTestCreation(body) {
  requireObject(body);
  rejectUnexpectedFields(body, ["name", "description", "price"]);

  const data = {
    name: requiredName(body.name),
    price: monetaryPrice(body.price),
  };
  if ("description" in body) {
    data.description = optionalDescription(body.description);
  }

  return data;
}

export function validateTestUpdate(body) {
  requireObject(body);
  rejectUnexpectedFields(body, ["name", "description", "price"]);

  if (!("name" in body) && !("description" in body) && !("price" in body)) {
    throw new AppError(400, "At least one of name, description, or price is required");
  }

  const data = {};
  if ("name" in body) {
    data.name = requiredName(body.name);
  }
  if ("description" in body) {
    data.description = optionalDescription(body.description);
  }
  if ("price" in body) {
    data.price = monetaryPrice(body.price);
  }

  return data;
}

export function validateTestStatus(body) {
  requireObject(body);
  rejectUnexpectedFields(body, ["isActive"]);

  if (typeof body.isActive !== "boolean") {
    throw new AppError(400, "isActive must be a boolean");
  }

  return { isActive: body.isActive };
}
