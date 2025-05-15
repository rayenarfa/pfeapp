import { loadStripe, Stripe } from "@stripe/stripe-js";
import { CartItem } from "../context/CartContext";
import { ShippingAddress } from "../types/OrderTypes";
import axios from "axios";

// Load the Stripe object with your publishable key from environment variables
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Check if the key is available to prevent runtime errors
if (!STRIPE_PUBLISHABLE_KEY) {
  console.error('Stripe publishable key is missing. Check your .env.local file.');
}

// Create a singleton to avoid multiple loads
let stripeInstance: Stripe | null = null;
export const getStripe = async (): Promise<Stripe> => {
  if (stripeInstance) return stripeInstance;

  try {
    const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
    if (!stripe) {
      throw new Error("Failed to load Stripe");
    }
    stripeInstance = stripe;
    return stripe;
  } catch (error) {
    console.error("Error loading Stripe:", error);
    throw new Error("Failed to load Stripe");
  }
};

// Export stripePromise for Elements provider
export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Function to create a payment intent
export const createPaymentIntent = async (
  items: CartItem[],
  shippingAddress: ShippingAddress
): Promise<{ clientSecret: string }> => {
  try {
    // Calculate the total amount
    const amount = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    console.log(`Creating payment intent for $${amount}`);

    // Call the server to create a real payment intent
    const response = await axios.post(
      "http://localhost:3001/api/create-payment-intent",
      {
        amount,
        items,
        shippingAddress,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
};

// Function to handle payment method confirmation
export const confirmPayment = async (
  clientSecret: string,
  paymentMethod: string,
  // We're not using shippingAddress directly in this function, but it's required for the type interface
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _shippingAddress: ShippingAddress
): Promise<{ success: boolean; error?: string }> => {
  try {
    const stripe = await getStripe();

    if (!stripe) {
      throw new Error("Stripe failed to load");
    }

    // Use the real Stripe API to confirm the payment
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: paymentMethod,
        // Set to save payment method for future use and associate with customer
        setup_future_usage: "off_session",
      }
    );

    if (error) {
      console.error("Error confirming payment:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log("Payment confirmed successfully:", paymentIntent?.id);
    return { success: true };
  } catch (error) {
    console.error("Error confirming payment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
