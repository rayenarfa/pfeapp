import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

interface StripePaymentFormProps {
  onPaymentMethodCreated: (paymentMethodId: string) => void;
  disabled?: boolean;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  onPaymentMethodCreated,
  disabled = false,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setProcessing(false);
      setError("Card element not found");
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      console.error("[Stripe error]", error);
      setError(error.message || "An error occurred with your payment");
      setProcessing(false);
    } else if (paymentMethod) {
      console.log("[PaymentMethod]", paymentMethod);
      onPaymentMethodCreated(paymentMethod.id);
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
      },
    },
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 border border-gray-300 rounded-md bg-white">
          <CardElement options={cardElementOptions} />
        </div>

        {error && (
          <div className="text-red-600 text-sm mt-2">
            <span className="font-medium">Error:</span> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || processing || disabled}
          className={`w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
            !stripe || processing || disabled
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {processing ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : (
            "Save Card"
          )}
        </button>
      </form>
    </div>
  );
};

export default StripePaymentForm;
