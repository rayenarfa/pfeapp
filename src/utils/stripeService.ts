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
    console.log("Loading Stripe with key:", STRIPE_PUBLISHABLE_KEY ? `${STRIPE_PUBLISHABLE_KEY.substring(0, 7)}...` : 'undefined');
    
    // Add better error handling for missing API key
    if (!STRIPE_PUBLISHABLE_KEY) {
      console.error("CRITICAL: Stripe publishable key is missing. Check your .env.local file.");
      throw new Error("Missing Stripe API key");
    }
    
    const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
    if (!stripe) {
      throw new Error("Failed to load Stripe - the loadStripe function returned null");
    }
    
    console.log("Stripe loaded successfully");
    stripeInstance = stripe;
    return stripe;
  } catch (error) {
    console.error("Error loading Stripe:", error);
    throw new Error(`Failed to load Stripe: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Export stripePromise for Elements provider
export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Function to create a payment intent
export const createPaymentIntent = async (
  items: CartItem[],
  shippingAddress: ShippingAddress
): Promise<{ clientSecret: string }> => {
  let retries = 0;
  const maxRetries = 2;

  while (retries <= maxRetries) {
    try {
      // Calculate the total amount
      const amount = items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      console.log(`Creating payment intent for $${amount} (attempt ${retries + 1})`);

      // Call the server to create a real payment intent
      const response = await axios.post(
        "http://localhost:3001/api/create-payment-intent",
        {
          amount,
          items,
          shippingAddress,
        },
        {
          // Add timeout to prevent hanging requests
          timeout: 10000, // 10 seconds
        }
      );

      console.log("Payment intent created successfully");
      return response.data;
    } catch (error) {
      retries++;
      
      // Provide detailed error information
      if (axios.isAxiosError(error)) {
        console.error(
          `Axios error creating payment intent (attempt ${retries}/${maxRetries + 1}):`,
          error.message,
          error.response?.status ? `Status: ${error.response.status}` : 'No status',
          error.code ? `Code: ${error.code}` : 'No error code'
        );

        // If server is not running or connection refused
        if (error.code === 'ECONNREFUSED') {
          console.error("Server connection refused. Make sure your backend server is running on port 3001");
          
          if (retries > maxRetries) {
            throw new Error("Payment server is not responding. Please make sure the server is running.");
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
      } else {
        console.error(`Error creating payment intent (attempt ${retries}/${maxRetries + 1}):`, error);
      }

      // If we've exhausted retries, throw the error
      if (retries > maxRetries) {
        throw error instanceof Error 
          ? error 
          : new Error("Failed to create payment. Please try again later.");
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // This shouldn't be reached due to the error handling above
  throw new Error("Unexpected error during payment processing");
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
