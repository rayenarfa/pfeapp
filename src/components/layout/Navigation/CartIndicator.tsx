import React from "react";
import { Link } from "react-router-dom";

interface CartIndicatorProps {
  count: number;
}

export const CartIndicator: React.FC<CartIndicatorProps> = ({ count }) => {
  return (
    <Link
      to="/cart"
      className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      aria-label={`Shopping cart with ${count} items`}
    >
      <svg
        className="w-6 h-6 text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>

      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
};

export default CartIndicator;
