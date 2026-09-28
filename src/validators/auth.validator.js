import { AppError } from "../utils/app-error.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function requireObject(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new AppError(400, "Request body must be an object");
  }
}

function normalizeEmail(email) {
  if (typeof email !== "string" || !email.trim()) {
    throw new AppError(400, "Email is required");
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!emailPattern.test(normalizedEmail)) {
    throw new AppError(400, "A valid email is required");
  }

  return normalizedEmail;
}

function validatePassword(password, { requireMinLength }) {
  if (typeof password !== "string" || !password) {
    throw new AppError(400, "Password is required");
  }

  if (requireMinLength && password.length < 8) {
    throw new AppError(400, "Password must be at least 8 characters long");
  }

  return password;
}

export function validateRegistration(body) {
  requireObject(body);

  if (typeof body.name !== "string" || !body.name.trim()) {
    throw new AppError(400, "Name is required");
  }

  return {
    name: body.name.trim(),
    email: normalizeEmail(body.email),
    password: validatePassword(body.password, { requireMinLength: true }),
  };
}

export function validateLogin(body) {
  requireObject(body);

  return {
    email: normalizeEmail(body.email),
    password: validatePassword(body.password, { requireMinLength: false }),
  };
}
