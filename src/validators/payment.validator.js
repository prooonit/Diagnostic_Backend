import { AppError } from "../utils/app-error.js";
import { isValidBookingId } from "./booking.validator.js";

const paymentResults = ["SUCCESS", "FAILED"];
const webhookEvents = {
  "payment.succeeded": "SUCCESS",
  "payment.failed": "FAILED",
};

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

export function validatePaymentInitiation(body) {
  requireObject(body);
  rejectUnexpectedFields(body, ["bookingId", "result"]);

  if (!isValidBookingId(body.bookingId)) {
    throw new AppError(400, "Booking ID must be a valid identifier");
  }
  if (!paymentResults.includes(body.result)) {
    throw new AppError(400, "Result must be SUCCESS or FAILED");
  }

  return { bookingId: body.bookingId, result: body.result };
}

export function validateWebhookEvent(body) {
  requireObject(body);
  rejectUnexpectedFields(body, ["eventId", "eventType", "paymentId", "bookingId", "status"]);

  const eventId = requiredText(body.eventId, "Event ID");
  const eventType = requiredText(body.eventType, "Event type");
  const paymentId = requiredText(body.paymentId, "Payment ID");
  if (!isValidBookingId(body.bookingId)) {
    throw new AppError(400, "Booking ID must be a valid identifier");
  }
  if (!(eventType in webhookEvents)) {
    throw new AppError(400, "Unsupported webhook event type");
  }
  if (body.status !== webhookEvents[eventType]) {
    throw new AppError(400, "Webhook status does not match event type");
  }

  return { eventId, eventType, paymentId, bookingId: body.bookingId, status: body.status };
}
