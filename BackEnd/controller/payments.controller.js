import Stripe from 'stripe';
import { paymentSchema } from '../validators/payment.schema.js';
import Reservation from '../models/Reservation.js'; // Ensure this exists
import dotenv from 'dotenv';
dotenv.config();

// Check for STRIPE_SECRET_KEY before initializing
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: process.env.STRIPE_API_VERSION || '2023-10-16',
});

/**
 * Create a PaymentIntent for Elements.
 * Body: { amount, currency, reservationNumber, userEmail, description, metadata }
 */
export async function createPaymentIntent(req, res, next) {
  try {
    // If this logs a Buffer or empty object, body-parsing is still wrong
    // console.log('BODY TYPE:', typeof req.body, req.body);

    const { error, value } = paymentSchema.validate({
      amount: req.body.amount,
      currency: (req.body.currency || 'USD').toUpperCase(),
      confirm: false,
      reservationNumber: req.body.reservationNumber,
      userEmail: req.body.userEmail,
      description: req.body.description,
      metadata: req.body.metadata,
    });

    if (error) {
      const err = new Error(error.details.map(d => d.message).join('; '));
      err.statusCode = 400;
      throw err;
    }

    const { amount, currency } = value;

    if (!Number.isInteger(amount) || amount <= 0) {
      const err = new Error("Amount must be a positive integer in minor units (e.g., LKR cents).");
      err.statusCode = 400;
      throw err;
    }

    // Stripe minimum amount validation
    const minimumAmount = currency === 'USD' ? 50 : 120; // 50 cents USD or ~120 LKR
    if (amount < minimumAmount) {
      console.log(`Amount ${amount} ${currency} is below minimum ${minimumAmount}. Adjusting to minimum.`);
      // Set amount to minimum required by Stripe
      value.amount = minimumAmount;
    }

    // Check if this is a new reservation or existing one
    const isNewReservation = !req.body.reservationNumber || 
                           req.body.reservationNumber === "NEW" || 
                           req.body.reservationNumber === "";

    let reservation = null;
    let idempotencyKey;

    if (!isNewReservation) {
      // For existing reservations, find the reservation
      reservation = await Reservation.findOne({ 
        reservationNumber: req.body.reservationNumber 
      });
      
      if (!reservation) {
        const err = new Error("Reservation not found");
        err.statusCode = 404;
        throw err;
      }

      // Use reservation's idempotency key for Stripe to prevent duplicates
      idempotencyKey = reservation.idempotencyKey 
        ? `pi_${reservation.idempotencyKey}` 
        : `pi_${req.body.reservationNumber}_${Date.now()}`;

      // Check if payment intent already exists for this reservation
      if (reservation.paymentIntentId) {
        console.log("Payment intent already exists for this reservation, returning existing client secret");
        try {
          const existingPI = await stripe.paymentIntents.retrieve(reservation.paymentIntentId);
          return res.status(200).json({ clientSecret: existingPI.client_secret });
        } catch (stripeError) {
          console.log("Existing payment intent not found in Stripe, creating new one");
          // Continue to create new payment intent
        }
      }
    } else {
      // For new reservations, create a deterministic idempotency key based on reservation details
      const userEmail = req.body.userEmail || req.body.metadata?.userEmail || 'unknown';
      const metadata = req.body.metadata || {};
      
      // Create a hash-like key based on ALL parameters that affect the payment intent
      const reservationHash = JSON.stringify({
        userEmail,
        amount: value.amount,
        currency,
        description: req.body.description,
        receiptEmail: req.body.userEmail,
        checkIn: metadata.checkIn,
        checkOut: metadata.checkOut,
        packageId: metadata.packageId,
        adults: metadata.adults || metadata.rooms,
        // Include all metadata to ensure uniqueness
        metadata: req.body.metadata || {},
        // Use a date bucket (hour) to allow retries within same hour but prevent duplicates
        dateBucket: new Date().toISOString().slice(0, 13) // YYYY-MM-DDTHH format
      });
      
      // Create a simple hash from the string
      let hash = 0;
      for (let i = 0; i < reservationHash.length; i++) {
        const char = reservationHash.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      
      idempotencyKey = `pi_new_${userEmail.replace(/[^a-zA-Z0-9]/g, '')}_${Math.abs(hash).toString(36)}`;
      
      console.log("Generated idempotency key for new reservation:", idempotencyKey);
      console.log("Request parameters:", {
        userEmail,
        amount: value.amount,
        currency,
        description: req.body.description,
        metadataKeys: Object.keys(req.body.metadata || {})
      });
    }

    let pi;
    try {
      pi = await stripe.paymentIntents.create({
        amount: value.amount, // Use the potentially adjusted amount
        currency,
        automatic_payment_methods: { 
          enabled: true, 
          allow_redirects: 'never' 
        },
        payment_method_options: {
          card: {
            request_three_d_secure: 'automatic'
          }
        },
        receipt_email: req.body.userEmail,
        description: isNewReservation ? "New Room Reservation" : `New Room Reservation (${req.body.reservationNumber})`,
        metadata: {
          reservationNumber: isNewReservation ? 'NEW' : String(req.body.reservationNumber || ''),
          userEmail: req.body.userEmail || '',
          isNewReservation: isNewReservation.toString(),
          ...(req.body.metadata || {}),
          environment: process.env.NODE_ENV || 'development',
        },
      }, {
        idempotencyKey: idempotencyKey,
      });
    } catch (stripeError) {
      // Handle idempotency key conflicts
      if (stripeError.type === 'StripeIdempotencyError') {
        console.log("Idempotency conflict detected, creating with new unique idempotency key");
        
        // Generate a new unique idempotency key with timestamp to avoid conflicts
        const fallbackIdempotencyKey = `${idempotencyKey}_retry_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
        
        pi = await stripe.paymentIntents.create({
          amount: value.amount,
          currency,
          automatic_payment_methods: { 
            enabled: true, 
            allow_redirects: 'never' 
          },
          payment_method_options: {
            card: {
              request_three_d_secure: 'automatic'
            }
          },
          receipt_email: req.body.userEmail,
          description: isNewReservation ? "New Room Reservation" : `New Room Reservation (${req.body.reservationNumber})`,
          metadata: {
            reservationNumber: isNewReservation ? 'NEW' : String(req.body.reservationNumber || ''),
            userEmail: req.body.userEmail || '',
            isNewReservation: isNewReservation.toString(),
            ...(req.body.metadata || {}),
            environment: process.env.NODE_ENV || 'development',
          },
        }, {
          idempotencyKey: fallbackIdempotencyKey,
        });
      } else {
        throw stripeError;
      }
    }

    // Only update reservation if it exists (not for new reservations)
    if (!isNewReservation && reservation) {
      await Reservation.findOneAndUpdate(
        { reservationNumber: req.body.reservationNumber },
        {
          paymentStatus: 'pending',
          paymentIntentId: pi.id,
          userId: req.user?.userId,
          ...req.body.metadata,
        },
        { upsert: false }
      );
    }
    // For new reservations, we'll update the reservation when it's created in PaymentForm after successful payment

    return res.status(201).json({ clientSecret: pi.client_secret });
  } catch (err) {
    next(err);
  }
}