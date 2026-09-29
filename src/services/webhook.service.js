import prisma from "../config/database.js";
import { AppError } from "../utils/app-error.js";

const paymentSelect = {
  id: true,
  bookingId: true,
  amount: true,
  status: true,
  providerPaymentId: true,
  createdAt: true,
  updatedAt: true,
};

const bookingSelect = {
  id: true,
  status: true,
  updatedAt: true,
};

function targetStates(eventType) {
  return eventType === "payment.succeeded"
    ? { paymentStatus: "SUCCESS", bookingStatus: "CONFIRMED" }
    : { paymentStatus: "FAILED", bookingStatus: "FAILED" };
}

export async function processWebhookEvent(event) {
  try {
    return await prisma.$transaction(async (tx) => {
      const webhookEvent = await tx.webhookEvent.create({
        data: {
          eventId: event.eventId,
          eventType: event.eventType,
          payload: event,
        },
        select: { id: true },
      });

      const payment = await tx.payment.findUnique({
        where: { providerPaymentId: event.paymentId },
        select: paymentSelect,
      });
      if (!payment) {
        throw new AppError(404, "Payment not found");
      }
      if (payment.bookingId !== event.bookingId) {
        throw new AppError(400, "Payment does not match booking");
      }

      const booking = await tx.booking.findUnique({
        where: { id: payment.bookingId },
        select: bookingSelect,
      });
      if (!booking) {
        throw new AppError(404, "Booking not found");
      }

      const { paymentStatus, bookingStatus } = targetStates(event.eventType);
      const alreadyInTargetState = payment.status === paymentStatus && booking.status === bookingStatus;
      if (!alreadyInTargetState && (payment.status !== "PENDING" || booking.status !== "PENDING")) {
        throw new AppError(400, "Webhook cannot transition the payment or booking from its current state");
      }

      const updatedPayment = alreadyInTargetState
        ? payment
        : await tx.payment.update({
          where: { id: payment.id },
          data: { status: paymentStatus },
          select: paymentSelect,
        });
      const updatedBooking = alreadyInTargetState
        ? booking
        : await tx.booking.update({
          where: { id: booking.id },
          data: { status: bookingStatus },
          select: bookingSelect,
        });

      await tx.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { processedAt: new Date() },
      });

      return { processed: true, payment: updatedPayment, booking: updatedBooking };
    }, { isolationLevel: "Serializable" });
  } catch (error) {
    if (error?.code === "P2002") {
      return { processed: false, reason: "already_processed" };
    }
    throw error;
  }
}
