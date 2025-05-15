import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "../../utils/stripeService";

interface StripeWrapperProps {
  children: React.ReactNode;
}

const StripeWrapper: React.FC<StripeWrapperProps> = ({ children }) => {
  return <Elements stripe={stripePromise}>{children}</Elements>;
};

export default StripeWrapper;
