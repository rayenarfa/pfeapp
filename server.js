/**
 * MAIN SERVER FILE (ES MODULES VERSION)
 * This is the primary server file for Stripe payment processing.
 * Start with: npm run server
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";
import nodemailer from "nodemailer"; // Added for Nodemailer
// Import from our pure JavaScript utility file for server use
import { createInvoicePdfDoc } from "./server-utils.js";

// Load environment variables from .env.local
dotenv.config({ path: './.env.local' });

// For debugging - log that we're trying to load environment variables
console.log('Loading environment variables from .env.local');

// Load environment variables directly from the .env.local file
dotenv.config({ path: './.env.local' });

// Setup email configuration manually based on values from .env.local
// This ensures we have the correct credentials for Nodemailer
const EMAIL_USER = 'pfe2025nsd@gmail.com'; // Your Gmail address from .env.local
const EMAIL_PASSWORD = 'ngad zkud ykpt tbcd'; // Your App Password from .env.local

// Log email configuration status (without showing full values)
console.log('Email configuration:');
console.log('- Email User:', EMAIL_USER ? `${EMAIL_USER.substring(0, 3)}...` : 'undefined');
console.log('- Email Password length:', EMAIL_PASSWORD ? EMAIL_PASSWORD.length : 0);

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

// New route to send invoice email
app.post("/api/send-invoice", async (req, res) => {
  try {
    const { order, subject } = req.body;

    if (!order || !order.customerEmail || !order.orderNumber) {
      return res.status(400).json({ success: false, message: 'Order data, customer email, or order number missing.' });
    }

    // 1. Generate the PDF
    const doc = createInvoicePdfDoc(order);
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // 2. Create a Nodemailer Transporter
    console.log('Setting up Nodemailer with the configured credentials');
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,     // Using our hard-coded value from above
        pass: EMAIL_PASSWORD, // Using our hard-coded value from above
      },
      debug: true, // Enable debug output
    });
    
    // Verify transporter connection
    try {
      await transporter.verify();
      console.log('SMTP connection verified successfully');
    } catch (error) {
      console.error('SMTP connection verification failed:', error.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Email server connection failed. Please try again later.' 
      });
    }

    // Extract gift card items if any
    const giftCardItems = order.items.filter(item => item.giftCardKey);
    
    // 3. Construct HTML content for the email body (customize as needed)
    const invoiceHtml = `
      <h1>Invoice for Order #${order.orderNumber}</h1>
      <p>Dear ${order.shippingAddress?.firstName || 'Customer'},</p>
      <p>Thank you for your order with SharePay! Your invoice is attached.</p>
      
      <p><b>Order Summary:</b></p>
      <ul>
        ${order.items.map(item => `<li>${item.name} (Qty: ${item.quantity}) - TND ${(item.price * item.quantity).toFixed(2)}</li>`).join('')}
      </ul>
      <h3>Grand Total: TND ${order.total.toFixed(2)}</h3>
      
      ${giftCardItems.length > 0 ? `
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #1F2937; margin-top: 0;">Your Gift Card Keys</h3>
        <p>Please find your gift card keys below:</p>
        <ul>
          ${giftCardItems.map(item => `<li><b>${item.name}:</b> <span style="font-family: monospace; background-color: #edf2f7; padding: 2px 5px;">${item.giftCardKey}</span></li>`).join('')}
        </ul>
        <p style="font-size: 12px; color: #4B5563;"><i>Note: These keys are also included in the attached PDF invoice for your records.</i></p>
      </div>
      ` : ''}
      
      <p>If you have any questions, please contact us at ${EMAIL_USER}.</p>
      <p>Thanks,<br/>The SharePay Team</p>
    `;

    // 4. Define Mail Options
    const mailOptions = {
      from: `"SharePay" <${process.env.VITE_EMAIL_USER}>`, // Sender address (shows 'SharePay' as sender name)
      to: order.customerEmail,                   // Recipient address
      subject: subject || `Your SharePay Invoice for Order #${order.orderNumber}`, // Use custom subject if provided
      html: invoiceHtml,                         // HTML body of the email
      attachments: [
        {
          filename: `Invoice_${order.orderNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    // 5. Send the Email
    await transporter.sendMail(mailOptions);
    console.log(`Invoice email sent successfully to ${order.customerEmail} for order ${order.orderNumber}`);
    res.status(200).json({ success: true, message: 'Invoice sent successfully.' });

  } catch (error) {
    console.error('Error sending invoice email:', error);
    res.status(500).json({ success: false, message: 'Failed to send invoice email.', error: error.message });
  }
});

// Start the server
const server = app.listen(port, () => {
  console.log(`Stripe server running on port ${port}`);
  console.log(`Server is running and ready to accept requests`);
  console.log(`Press Ctrl+C to stop the server`);
  
  // Add a periodic check to show server is still alive
  setInterval(() => {
    console.log(`Server still running on port ${port} - ${new Date().toISOString()}`);
  }, 30000); // Log every 30 seconds
});

// Handle server shutdown gracefully
process.on('SIGINT', () => {
  console.log('\nShutting down server gracefully...');
  server.close(() => {
    console.log('Server shut down successfully');
    process.exit(0);
  });
});

// Log any uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Keep the server running despite the error
});

