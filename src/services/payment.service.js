import { randomUUID } from "node:crypto";
import prisma from "../config/database.js";
import { AppError } from "../utils/app-error.js";
import { processWebhookEvent } from "./webhook.service.js";

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

export async function initiatePayment(userId, { bookingId, result }) {
  let payment;
  try {
    payment = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findFirst({
        where: { id: bookingId, userId },
        select: { id: true, amount: true, status: true },
      });
      if (!booking) {
        throw new AppError(404, "Booking not found");
      }
      if (booking.status !== "PENDING") {
        throw new AppError(400, "Payment can only be initiated for a pending booking");
      }

      const existingPayment = await tx.payment.findUnique({
        where: { bookingId: booking.id },
        select: { id: true },
      });
      if (existingPayment) {
        throw new AppError(409, "A payment already exists for this booking");
      }

      return tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.amount,
          status: "PENDING",
          providerPaymentId: `sim_pay_${randomUUID()}`,
        },
        select: paymentSelect,
      });
    });
  } catch (error) {
    if (error?.code === "P2002") {
      throw new AppError(409, "A payment already exists for this booking");
    }
    throw error;
  }

  const eventType = result === "SUCCESS" ? "payment.succeeded" : "payment.failed";
  const webhookResult = await processWebhookEvent({
    eventId: `sim_evt_${randomUUID()}`,
    eventType,
    paymentId: payment.providerPaymentId,
    bookingId: payment.bookingId,
    status: result,
  });

  return {
    payment: webhookResult.payment,
    booking: webhookResult.booking,
  };
}
