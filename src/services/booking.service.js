import prisma from "../config/database.js";
import { AppError } from "../utils/app-error.js";
import { isValidBookingId } from "../validators/booking.validator.js";

const bookingSelect = {
  id: true,
  centerId: true,
  testId: true,
  appointmentAt: true,
  amount: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  center: {
    select: { id: true, name: true, slug: true, location: true },
  },
  test: {
    select: { id: true, name: true, description: true },
  },
};

export async function createBooking(userId, { centerSlug, testId, appointmentAt }) {
  return prisma.$transaction(async (tx) => {
    const center = await tx.diagnosticCenter.findFirst({
      where: { slug: centerSlug, isActive: true },
      select: { id: true },
    });
    if (!center) {
      throw new AppError(404, "Center not found");
    }

    const test = await tx.diagnosticTest.findFirst({
      where: { id: testId, centerId: center.id, isActive: true },
      select: { id: true, price: true },
    });
    if (!test) {
      throw new AppError(404, "Diagnostic test not found");
    }

    const duplicate = await tx.booking.findFirst({
      where: { userId, testId: test.id, appointmentAt },
      select: { id: true },
    });
    if (duplicate) {
      throw new AppError(409, "An identical booking already exists");
    }

    return tx.booking.create({
      data: {
        userId,
        centerId: center.id,
        testId: test.id,
        appointmentAt,
        amount: test.price,
        status: "PENDING",
      },
      select: bookingSelect,
    });
  });
}

export async function listUserBookings(userId, { skip, take }) {
  const where = { userId };
  const [bookings, total] = await prisma.$transaction([
    prisma.booking.findMany({
      where,
      select: bookingSelect,
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.count({ where }),
  ]);

  return { bookings, total };
}

export async function getUserBooking(userId, bookingId) {
  if (!isValidBookingId(bookingId)) {
    throw new AppError(404, "Booking not found");
  }

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
    select: bookingSelect,
  });
  if (!booking) {
    throw new AppError(404, "Booking not found");
  }

  return booking;
}

export async function cancelUserBooking(userId, bookingId) {
  const booking = await getUserBooking(userId, bookingId);
  if (booking.status !== "PENDING") {
    throw new AppError(400, "Only pending bookings can be cancelled");
  }

  return prisma.booking.update({
    where: { id: booking.id },
    data: { status: "CANCELLED" },
    select: bookingSelect,
  });
}
