import Stripe from "stripe";

let stripe;
export function getStripe() {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("Missing STRIPE_SECRET_KEY in env");
    stripe = new Stripe(key, {
      apiVersion: process.env.STRIPE_API_VERSION || "2023-10-16",
    });
  }
  return stripe;
}
