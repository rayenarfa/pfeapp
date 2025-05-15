/**
 * MAIN SERVER FILE (ES MODULES VERSION)
 * This is the primary server file for Stripe payment processing.
 * Start with: npm run server
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";

// Load environment variables from .env.local
dotenv.config({ path: './.env.local' });

// For debugging - log that we're trying to load environment variables
console.log('Loading environment variables from .env.local');

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001;

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY);

// Check if the key is available to prevent runtime errors
if (!process.env.VITE_STRIPE_SECRET_KEY) {
  console.error('Stripe secret key is missing. Check your .env.local file.');
}

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.post("/api/create-payment-intent", async (req, res) => {
  try {
    const { amount, items, shippingAddress } = req.body;

    console.log(`Creating payment intent for amount: ${amount}`);

    // Get customer email from shipping address if available
    const customerEmail = shippingAddress?.email || "";

    // Simple customer object
    let customer;
    if (customerEmail) {
      try {
        // Create a simple customer with just email
        customer = await stripe.customers.create({
          email: customerEmail,
        });
        console.log(`Created customer with ID: ${customer.id}`);
      } catch (customerError) {
        console.error("Error creating customer:", customerError);
        // Continue even if customer creation fails
      }
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      payment_method_types: ["card"],
      customer: customer?.id, // Set customer if created
      receipt_email: customerEmail, // Add receipt email
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

// Start the server
app.listen(port, () => {
  console.log(`Stripe server running on port ${port}`);
});
