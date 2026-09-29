import {
  cancelUserBooking,
  createBooking,
  getUserBooking,
  listUserBookings,
} from "../services/booking.service.js";
import { validateBookingCreation } from "../validators/booking.validator.js";
import { getPaginationMetadata, parsePagination } from "../utils/pagination.js";

export async function create(req, res, next) {
  try {
    const booking = await createBooking(req.user.id, validateBookingCreation(req.body));
    return res.status(201).json({ booking });
  } catch (error) {
    return next(error);
  }
}

export async function list(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const result = await listUserBookings(req.user.id, { skip, take: limit });
    return res.status(200).json({
      data: result.bookings,
      pagination: getPaginationMetadata(page, limit, result.total),
    });
  } catch (error) {
    return next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const booking = await getUserBooking(req.user.id, req.params.id);
    return res.status(200).json({ booking });
  } catch (error) {
    return next(error);
  }
}

export async function cancel(req, res, next) {
  try {
    const booking = await cancelUserBooking(req.user.id, req.params.id);
    return res.status(200).json({ booking });
  } catch (error) {
    return next(error);
  }
}
