import { getStripe } from "../lib/stripeClient.js";
const stripe = getStripe();

/**
 * Only for server-side tests (NEVER expose raw card collection to clients).
 */
const payWithRawCard = async ({
  number,
  cvc,
  exp_month,
  exp_year,
  amount,
  currency = "USD",
  confirm = true,
  reservationNumber,
  userEmail,
  description,
  metadata = {},
}) => {
  try {
    const pm = await stripe.paymentMethods.create({
      type: "card",
      card: { number, exp_month, exp_year, cvc },
    });

    return stripe.paymentIntents.create(
      {
        amount,
        currency,
        payment_method: pm.id,
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
        idempotencyKey: `raw_${reservationNumber || "nores"}_${amount}`,
      }
    );
  } catch (error) {
    console.error("Stripe (raw) error:", error);
    throw error;
  }
};

export default payWithRawCard;
