import React, { useState } from "react";

// List of Tunisian governorates
const TUNISIAN_GOVERNORATES = [
  "Tunis",
  "Ariana",
  "Ben Arous",
  "Manouba",
  "Bizerte",
  "Nabeul",
  "Zaghouan",
  "Beja",
  "Jendouba",
  "El Kef",
  "Siliana",
  "Kairouan",
  "Kasserine",
  "Sidi Bouzid",
  "Sousse",
  "Monastir",
  "Mahdia",
  "Sfax",
  "Gabes",
  "Medenine",
  "Tataouine",
  "Gafsa",
  "Tozeur",
  "Kebili"
];
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { useCart } from "../../context/CartContext";
import { motion } from "framer-motion";
import { createOrder } from "../../utils/orderUtils";
import { loadStripe } from "@stripe/stripe-js";
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { createPaymentIntent, confirmPayment } from "../../utils/stripeService";

// Initialize Stripe using publishable key from environment variables
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Check if the key is available to prevent runtime errors
if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
  console.error('Stripe publishable key is missing. Check your .env.local file.');
}

// Define form data interface
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
}

// Checkout form component
const CheckoutForm = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formTouched] = useState(false);

  // Stripe hooks
  const stripe = useStripe();
  const elements = useElements();

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for this field when user types
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: "",
      });
    }
  };

  const subtotal = totalPrice;
  const tax = 0; // No tax
  const shipping = 0; // Free shipping
  const total = subtotal + tax + shipping;

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate all fields
    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.address.trim()) errors.address = "Address is required";
    if (!formData.city.trim()) errors.city = "Governorate is required";
    
    if (!formData.zipCode.trim()) {
      errors.zipCode = "Postal code is required";
    } else if (!/^\d{4}$/.test(formData.zipCode)) {
      errors.zipCode = "Postal code must be exactly 4 digits";
    }

    // Check if cart is empty
    if (cartItems.length === 0) {
      setError("Your cart is empty. Please add items before checking out.");
      return false;
    }

    // Update error state
    setFieldErrors(errors);

    // Form is valid if there are no errors
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Get card element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setError("Card element not found");
        setIsProcessing(false);
        return;
      }

      // 2. Create payment method using the card element
      const { error: paymentMethodError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
        });

      if (paymentMethodError) {
        setError(paymentMethodError.message || "Failed to process your card");
        setIsProcessing(false);
        return;
      }

      if (!paymentMethod) {
        setError("Could not create payment method");
        setIsProcessing(false);
        return;
      }

      // 3. Create a payment intent by calling our server
      const { clientSecret } = await createPaymentIntent(cartItems, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        zipCode: formData.zipCode,
      });

      // 4. Confirm the payment with the payment method ID
      const { success, error: paymentError } = await confirmPayment(
        clientSecret,
        paymentMethod.id,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
        }
      );

      if (!success) {
        setError(paymentError || "Payment failed");
        setIsProcessing(false);
        return;
      }

      // 5. Create order in Firestore (which is available in free tier)
      // Add empty state property for backward compatibility with existing order creation system
      const shippingAddressWithState = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        zipCode: formData.zipCode,
        state: "", // Add empty state for compatibility
      };
      
      const orderId = await createOrder(
        cartItems,
        shippingAddressWithState,
        {
          cardType: "Credit Card",
          lastFour: "4242", // Simulated last 4 digits
        },
        total
      );

      if (orderId) {
        setIsProcessing(false);
        setOrderComplete(true);
        // Clear cart and redirect to order confirmation
        setTimeout(() => {
          clearCart();
          navigate(`/order-confirmation?orderId=${orderId}`);
        }, 2000);
      } else {
        // Order creation failed
        setError("Failed to create your order. Please try again.");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("Error processing payment:", err);
      setError("An error occurred processing your payment. Please try again.");
      setIsProcessing(false);
    }
  };

  // Card Element styling
  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
        iconColor: "#6772e5",
      },
      invalid: {
        color: "#9e2146",
        iconColor: "#fa755a",
      },
    },
    hidePostalCode: true,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Navbar />
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 flex-grow">
        <main className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4 sm:mb-8 text-center bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600"
            >
              Checkout
            </motion.h1>

            {orderComplete ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white p-8 rounded-xl shadow-xl text-center"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Order Complete!
                </h2>
                <p className="text-gray-600 mb-6">
                  Thank you for your purchase. Your order is being processed.
                </p>
                <div className="bg-indigo-50 p-4 mb-6 rounded-lg">
                  <div className="flex items-center mb-2">
                    <svg
                      className="w-5 h-5 text-indigo-600 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-indigo-700 font-medium text-sm">
                      Email Confirmation
                    </p>
                  </div>
                  <p className="text-gray-700 text-sm">
                    A confirmation email with your gift card keys has been sent
                    to <span className="font-medium">{formData.email}</span>
                  </p>
                </div>
                <Link
                  to="/"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Continue Shopping
                </Link>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-xl overflow-hidden"
              >
                <form onSubmit={handleSubmit}>
                  <div className="p-6 space-y-6">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4">
                        Order Summary
                      </h2>
                      <div className="space-y-2 mb-6">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex items-center py-2">
                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="h-full w-full object-cover object-center"
                              />
                            </div>
                            <div className="ml-4 flex-1">
                              <h3 className="text-sm font-medium text-gray-900">
                                {item.name}
                              </h3>
                              <p className="mt-1 text-sm text-gray-500">
                                Qty: {item.quantity}
                              </p>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                              TND {(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-between">
                          <p className="text-sm text-gray-600">Subtotal</p>
                          <p className="text-sm font-medium text-gray-900">
                            TND {subtotal.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex justify-between py-1">
                          <p className="text-sm text-gray-600">Shipping</p>
                          <p className="text-sm font-medium text-green-600">
                            Free
                          </p>
                        </div>
                        <div className="flex justify-between mt-2 pt-2 border-t border-gray-200">
                          <p className="text-base font-medium text-gray-900">
                            Total
                          </p>
                          <p className="text-base font-bold text-gray-900">
                            TND {total.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4">
                        Shipping Information
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="firstName"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            First Name
                          </label>
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            className={`w-full p-2 border ${
                              fieldErrors.firstName
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
                          />
                          {fieldErrors.firstName && (
                            <p className="mt-1 text-sm text-red-600">
                              {fieldErrors.firstName}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="lastName"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Last Name
                          </label>
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            className={`w-full p-2 border ${
                              fieldErrors.lastName
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
                          />
                          {fieldErrors.lastName && (
                            <p className="mt-1 text-sm text-red-600">
                              {fieldErrors.lastName}
                            </p>
                          )}
                        </div>
                        <div className="sm:col-span-2">
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className={`w-full p-2 border ${
                              fieldErrors.email
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
                          />
                          {fieldErrors.email && (
                            <p className="mt-1 text-sm text-red-600">
                              {fieldErrors.email}
                            </p>
                          )}
                        </div>
                        <div className="sm:col-span-2">
                          <label
                            htmlFor="address"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Street Address
                          </label>
                          <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            className={`w-full p-2 border ${
                              fieldErrors.address
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
                          />
                          {fieldErrors.address && (
                            <p className="mt-1 text-sm text-red-600">
                              {fieldErrors.address}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="city"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Governorate
                          </label>
                          <select
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            required
                            className={`w-full p-2 border ${
                              fieldErrors.city
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
                          >
                            <option value="">Select a governorate</option>
                            {TUNISIAN_GOVERNORATES.map(governorate => (
                              <option key={governorate} value={governorate}>
                                {governorate}
                              </option>
                            ))}
                          </select>
                          {fieldErrors.city && (
                            <p className="mt-1 text-sm text-red-600">
                              {fieldErrors.city}
                            </p>
                          )}
                        </div>
                        <div>
                          <div>
                            <label
                              htmlFor="zipCode"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Postal/ZIP Code
                            </label>
                            <input
                              type="text"
                              id="zipCode"
                              name="zipCode"
                              value={formData.zipCode}
                              onChange={handleChange}
                              required
                              pattern="[0-9]{4}"
                              maxLength={4}
                              className={`w-full p-2 border ${
                                fieldErrors.zipCode
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
                              placeholder="4-digit postal code"
                              autoComplete="off"
                              onInput={(e) => {
                                e.currentTarget.value = e.currentTarget.value.replace(
                                  /[^0-9]/g,
                                  ""
                                ).slice(0, 4);
                              }}
                            />
                            {fieldErrors.zipCode && (
                              <p className="mt-1 text-sm text-red-600">
                                {fieldErrors.zipCode}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4">
                        Payment Information
                      </h2>

                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-md">
                          <p className="text-sm text-gray-700 mb-2">
                            Enter your card details below. For testing, use card
                            number 4242 4242 4242 4242 with any future
                            expiration date and any 3-digit CVC.
                          </p>
                          <div
                            className={`p-3 border ${
                              !cardComplete && formTouched
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-md bg-white relative`}
                          >
                            <CardElement
                              options={cardElementOptions}
                              onChange={(e) => {
                                setCardComplete(e.complete);
                                if (e.error) setError(e.error.message);
                                else setError(null);
                              }}
                            />
                            {cardComplete && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <svg
                                  className="w-5 h-5 text-green-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                  ></path>
                                </svg>
                              </div>
                            )}
                          </div>
                          {!cardComplete && formTouched && (
                            <p className="mt-1 text-sm text-red-600">
                              Please enter valid card information
                            </p>
                          )}
                        </div>

                        {error && (
                          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-600 text-sm">
                            {error}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-4 py-5 sm:px-6 flex justify-between border-t border-gray-200">
                    <Link
                      to="/cart"
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Back to Cart
                    </Link>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isProcessing || !stripe}
                      className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                        isProcessing || !stripe
                          ? "bg-indigo-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                      }`}
                    >
                      {isProcessing ? (
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
                        <span className="flex items-center">
                          Place Order
                          <svg
                            className="ml-2 w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                          </svg>
                        </span>
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center sm:flex sm:justify-between sm:text-left">
            <motion.p whileHover={{ x: 2 }} className="text-sm text-gray-500">
              &copy; 2025 SharePay. All rights reserved.
            </motion.p>
            <div className="flex justify-center sm:justify-end space-x-6 mt-3 sm:mt-0">
              <motion.a
                whileHover={{ y: -2 }}
                href="#"
                className="text-gray-400 hover:text-indigo-600 transition-colors duration-200"
              >
                <span className="sr-only">Privacy Policy</span>
                <span className="text-sm">Privacy Policy</span>
              </motion.a>
              <motion.a
                whileHover={{ y: -2 }}
                href="#"
                className="text-gray-400 hover:text-indigo-600 transition-colors duration-200"
              >
                <span className="sr-only">Terms of Service</span>
                <span className="text-sm">Terms of Service</span>
              </motion.a>
              <motion.a
                whileHover={{ y: -2 }}
                href="#"
                className="text-gray-400 hover:text-indigo-600 transition-colors duration-200"
              >
                <span className="sr-only">Contact Us</span>
                <span className="text-sm">Contact Us</span>
              </motion.a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Main checkout page component that wraps the form with Stripe Elements
const CheckoutPage: React.FC = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default CheckoutPage;
