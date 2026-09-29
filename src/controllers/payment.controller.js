import { initiatePayment } from "../services/payment.service.js";
import { processWebhookEvent } from "../services/webhook.service.js";
import { validatePaymentInitiation, validateWebhookEvent } from "../validators/payment.validator.js";

export async function create(req, res, next) {
  try {
    const result = await initiatePayment(req.user.id, validatePaymentInitiation(req.body));
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function webhook(req, res, next) {
  try {
    const result = await processWebhookEvent(validateWebhookEvent(req.body));
    if (!result.processed) {
      return res.status(200).json({ received: true, processed: false, reason: result.reason });
    }
    return res.status(200).json({ received: true, processed: true });
  } catch (error) {
    return next(error);
  }
}
