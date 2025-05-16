import { onRequest } from "firebase-functions/v2/https";
import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import Stripe from "stripe";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY);

// Check if the key is available to prevent runtime errors
if (!process.env.VITE_STRIPE_SECRET_KEY) {
  console.error('Stripe secret key is missing. Check your Firebase environment variables.');
}

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Create payment intent endpoint
app.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body;

    console.log(`Creating payment intent for amount: ${amount} cents`);

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(amount, 10), // Cast to integer to ensure proper format
      currency: "usd",
      payment_method_types: ["card"],
    });

    console.log(`Payment intent created with ID: ${paymentIntent.id}`);

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- Import and mount sendInvoice endpoint ---
import { sendInvoice } from './sendInvoice.js';
app.post('/send-invoice', sendInvoice);

// Export the Express API as a Firebase function
export const stripe_api = onRequest(app);
