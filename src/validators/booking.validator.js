import { AppError } from "../utils/app-error.js";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const timestampPattern = /^(\d{4})-(\d{2})-(\d{2})T([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d)(?:\.\d{1,3})?)?(Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/;

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

function requiredCenterSlug(value) {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError(400, "Center slug is required");
  }

  return value.trim();
}

function requiredTestId(value) {
  if (typeof value !== "string" || !uuidPattern.test(value)) {
    throw new AppError(400, "Test ID must be a valid identifier");
  }

  return value;
}

function futureAppointment(value) {
  if (typeof value !== "string") {
    throw new AppError(400, "Appointment date and time is required");
  }

  const match = value.match(timestampPattern);
  if (!match) {
    throw new AppError(400, "Appointment date and time must be a valid ISO timestamp with a timezone");
  }

  const [, year, month, day] = match;
  const calendarDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (
    calendarDate.getUTCFullYear() !== Number(year)
    || calendarDate.getUTCMonth() !== Number(month) - 1
    || calendarDate.getUTCDate() !== Number(day)
  ) {
    throw new AppError(400, "Appointment date and time must be valid");
  }

  const appointmentAt = new Date(value);
  if (Number.isNaN(appointmentAt.getTime())) {
    throw new AppError(400, "Appointment date and time must be valid");
  }
  if (appointmentAt <= new Date()) {
    throw new AppError(400, "Appointment date and time must be in the future");
  }

  return appointmentAt;
}

export function validateBookingCreation(body) {
  requireObject(body);
  rejectUnexpectedFields(body, ["centerSlug", "testId", "appointmentAt"]);

  return {
    centerSlug: requiredCenterSlug(body.centerSlug),
    testId: requiredTestId(body.testId),
    appointmentAt: futureAppointment(body.appointmentAt),
  };
}

export function isValidBookingId(value) {
  return typeof value === "string" && uuidPattern.test(value);
}
