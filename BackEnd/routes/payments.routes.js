// routes/payments.routes.js
import express from 'express';
import Stripe from 'stripe';
import { createPaymentIntent } from '../controller/payments.controller.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Use the controller function instead of inline code
router.post('/create-payment-intent', createPaymentIntent);

// Export the router as default
export default router;
