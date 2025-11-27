import { getStripe } from "../lib/stripeClient.js";
const stripe = getStripe();

export async function payWithPaymentMethod({
  payment_method,
  amount,
  currency = "USD",
  confirm = true,
  reservationNumber,
  userEmail,
  description,
  metadata = {},
}) {
  return stripe.paymentIntents.create(
    {
      amount,
      currency,
      payment_method,
      confirm,
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      receipt_email: userEmail,
      description,
      metadata: {
        reservationNumber: reservationNumber ? String(reservationNumber) : "",
        userEmail: userEmail || "",
        ...metadata,
        environment: process.env.NODE_ENV || "development",
      },
    },
    {
      idempotencyKey: `pay_${reservationNumber || "nores"}_${payment_method}_${amount}`,
    }
  );
}
