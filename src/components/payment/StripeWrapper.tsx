import React, { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { Stripe, StripeElementsOptions } from "@stripe/stripe-js";
import { getStripe } from "../../utils/stripeService";

interface StripeWrapperProps {
  children: React.ReactNode;
}

const StripeWrapper: React.FC<StripeWrapperProps> = ({ children }) => {
  const [stripeInstance, setStripeInstance] = useState<Stripe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load Stripe asynchronously
    const initializeStripe = async () => {
      try {
        console.log("Initializing Stripe in StripeWrapper...");
        const stripe = await getStripe();
        setStripeInstance(stripe);
        setLoading(false);
      } catch (err) {
        console.error("Error initializing Stripe:", err);
        setError(err instanceof Error ? err.message : "Failed to load Stripe");
        setLoading(false);
      }
    };

    initializeStripe();
  }, []);

  // Options for Stripe Elements
  const options: StripeElementsOptions = {
    fonts: [
      {
        cssSrc: 'https://fonts.googleapis.com/css?family=Roboto',
      },
    ],
  };

  if (loading) {
    return <div className="p-4 text-center">Loading payment system...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>Error loading payment system: {error}</p>
        <p>Please refresh the page or try again later.</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripeInstance} options={options}>
      {children}
    </Elements>
  );
};

export default StripeWrapper;
