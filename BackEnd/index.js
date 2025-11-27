import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import Stripe from "stripe";

import userRouter from './routes/userRouter.js';
import reservationRouter from './routes/reservationRoutes.js';
import paymentsRouter from './routes/payments.routes.js';
import verifyJwt from './middleware/auth.js';
import Reservation from './models/Reservation.js';
import roomRoutes from './routes/roomRoutes.js';
import packagesRouter from "./routes/SpackageRoutes.js";
import reviewRouter from './routes/reviewRouter.js';
import artisanalRouter from './routes/artisanalRouter.js';
import roomPkg from './routes/room_packages_routes.js';
import chatbotRouter from './routes/chatbotRoutes.js';
import promotionRouter from "./routes/offersAndPromotionsRoute.js";


import menuItemRouter from './routes/MenuItemRoutes.js';
import foodBookingRouter from './routes/foodBookingRoutes.js';
import foodBookingAnalyticsRouter from './routes/foodBookingAnalyticsRoutes.js';
import safariBookingRouter from './routes/safariBookingRoutes.js';
import analyticsRouter from './routes/analyticsRoutes.js';
import path from "path"; 
import { fileURLToPath } from "url";
import { dirname } from "path";
import NotificationRouter from "./routes/notificationRoutes.js";
import roomTypeRouter from "./routes/roomTypeRoutes.js";
import bedLabelRouter from "./routes/bedLabelRoutes.js";


const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Load environment variables
dotenv.config({ debug: true });

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("Error: STRIPE_SECRET_KEY is not defined in .env");
  process.exit(1);
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: process.env.STRIPE_API_VERSION || "2023-10-16",
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);  // ✅ cleaner


const app = express();

// CORS configuration to allow specific origin and credentials
const corsOptions = {
  origin: [process.env.FRONTEND_URL,'http://localhost:5173', 'http://localhost:5174',],  // Your front-end origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'idempotency-key'],
  credentials: true,  // Allow credentials (cookies, tokens)
};

app.use(cors(corsOptions));

/** ---------------- Stripe webhook (RAW body) ----------------
 * MUST be defined BEFORE express.json(), otherwise signature verify fails.
 */
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook Error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  
    try{
      switch (event.type) {
        case 'payment_intent.succeeded': {
          const pi = event.data.object;
          await Reservation.findOneAndUpdate(
            { paymentIntentId: pi.id },
            { paymentStatus: 'paid' },
            { new: true }
          );
          break;
        }
        case 'payment_intent.payment_failed': {
          const pi = event.data.object;
          await Reservation.findOneAndUpdate(
            { paymentIntentId: pi.id },
            { paymentStatus: 'failed' },
            { new: true }
          );
          break;
        }
        default:
          console.log(`Unhandled event: ${event.type}`);
      }
      res.json({ received: true });
    }catch(e){
      console.error("Webhook handler error: ", e)
      res.status(500).json({ message: "Webhook handler error" });
    }
});

// After webhook: normal JSON for the rest of the app
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Other routes (no global verifyJwt—apply per-router)
app.use('/api/user', userRouter); // Public for login/register
app.use("/api/reservations", reservationRouter);
app.use('/api/payment', verifyJwt, paymentsRouter); // Assuming payments need auth
app.use("/api/room-packages", roomRoutes);
app.use("/api/room", roomRoutes); // Add room routes for direct access
app.use("/api/safari-packages", packagesRouter);
app.use('/api/artisanal', artisanalRouter);
app.use('/api/review', reviewRouter);
app.use('/api/room_package', roomPkg);
app.use('/api/chatbot', chatbotRouter);
app.use('/api/promotions', promotionRouter);
app.use('/api/notifications', NotificationRouter);
app.use('/api/menu', menuItemRouter);
app.use('/api/food-bookings', foodBookingRouter);
app.use('/api/food-bookings', foodBookingAnalyticsRouter);
app.use('/api/safari-bookings', safariBookingRouter);
app.use('/api/packages', packagesRouter);
app.use('/api/room-types', roomTypeRouter);
app.use('/api/bed-labels', bedLabelRouter);
app.use('/api', analyticsRouter); // Analytics routes

// Example checkout session (adjust success/cancel URLs to your frontend)
app.post("/create-checkout-session", verifyJwt, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Subscription" },
            unit_amount: 1000, // $10
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${FRONTEND_URL}/success`,
      cancel_url: `${FRONTEND_URL}/cancel`,
    });
    res.json({ id: session.id });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ error: error.message });
  }
});

/** 404 + error handlers */
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

app.use((error, req, res, _next) => {
  const status = error.statusCode || error.status || 500;
  res.status(status).json({
    success: false,
    message: error.message || "Internal Server Error",
    type: error.type,
    code: error.code,
    decline_code: error.decline_code,
    param: error.param,
  });
});

/** DB + start */
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to the database"))
  .catch((err) => console.error("Connection Failed:", err));


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
