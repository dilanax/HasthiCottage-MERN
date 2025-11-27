import { paymentSchema } from "../validators/payment.schema.js";
import payWithRawCard from "../services/stripe.raw.service.js";
import { payWithPaymentMethod } from "../services/stripe.pm.service.js";

function normalizeYear(exp_year) {
  const s = String(exp_year);
  return s.length === 2 ? 2000 + parseInt(s, 10) : parseInt(s, 10);
}

export async function createPayment(req, res, next) {
  try {
    const { value, error } = paymentSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((d) => d.message).join("; ");
      const err = new Error(msg);
      err.statusCode = 400;
      throw err;
    }

    const {
      reservationNumber,
      userEmail,
      description,
      metadata,
      currency,
      confirm,
      amount,
    } = value;

    let result;

    if (value.payment_method) {
      // Tokenized method path (recommended for Postman)
      result = await payWithPaymentMethod({
        payment_method: value.payment_method,
        amount,
        currency,
        confirm,
        reservationNumber,
        userEmail,
        description,
        metadata,
      });
    } else {
      // Raw card path (server-side test only)
      result = await payWithRawCard({
        number: String(value.number).replace(/\s+/g, ""),
        cvc: String(value.cvc),
        exp_month: parseInt(value.exp_month, 10),
        exp_year: normalizeYear(value.exp_year),
        amount,
        currency,
        confirm,
        reservationNumber,
        userEmail,
        description,
        metadata,
      });
    }

    res.status(201).json({ success: true, message: "Payment Successful", result });
  } catch (err) {
    next(err);
  }
}
