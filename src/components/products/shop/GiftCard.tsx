import React, { useState } from "react";
import { motion } from "framer-motion";
import { Product } from "../../../types/product";

export interface GiftCardProps {
  product: Product;
  onAddToCart: (e: React.MouseEvent) => void;
  onCardClick: () => void;
  isInCart: boolean;
  size?: "small" | "medium" | "large";
  layout?: "grid" | "horizontal";
}

export const GiftCardSkeleton: React.FC<{ layout?: "grid" | "horizontal" }> = ({
  layout = "grid",
}) => {
  if (layout === "horizontal") {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse border border-gray-100 flex h-40">
        <div className="w-1/3 bg-gray-200"></div>
        <div className="p-3 flex-grow flex flex-col">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="mt-auto">
            <div className="h-8 bg-gray-200 rounded w-full mt-3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse border border-gray-100 h-full flex flex-col">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-3 flex-grow flex flex-col">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="mt-auto flex justify-between pt-2">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          <div className="h-5 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );
};

const GiftCard: React.FC<GiftCardProps> = ({
  product,
  onAddToCart,
  onCardClick,
  isInCart,
  size = "medium",
  layout = "grid",
}) => {
  const { name, price, imageUrl, brand, region, currency, stock, discount } =
    product;
  const [isAdding, setIsAdding] = useState(false);
  const [showAdded, setShowAdded] = useState(false);

  // Calculate discounted price properly without showing 0
  const calculateFinalPrice = (price: number, discount?: number) => {
    return discount && discount > 0 ? price * (1 - discount / 100) : price;
  };

  const finalPrice = calculateFinalPrice(price, discount);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking the button
    if (stock <= 0) return;

    setIsAdding(true);
    onAddToCart(e);

    setTimeout(() => {
      setIsAdding(false);
      setShowAdded(true);
      setTimeout(() => setShowAdded(false), 1500);
    }, 800);
  };

  // Different sizes for cards
  const cardSizes = {
    small: "h-40",
    medium: "h-48",
    large: "h-56",
  };

  if (layout === "horizontal") {
    return (
      <motion.div
        onClick={onCardClick}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden transition-all duration-300 border border-gray-100 flex group cursor-pointer"
        whileHover={{ y: -4, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)" }}
      >
        <div className={`relative w-1/3 overflow-hidden`}>
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {discount && discount > 0 && (
            <div className="absolute top-2 left-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500 text-white shadow-sm">
                {discount}% OFF
              </span>
            </div>
          )}
          {stock <= 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <span className="text-white font-medium text-lg">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col justify-between w-2/3">
          <div>
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-medium text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-full">
                {brand}
              </span>
              <span className="text-xs font-medium text-gray-500 px-2 py-0.5 bg-gray-50 rounded-full">
                {region}
              </span>
            </div>
            <h3 className="text-gray-800 font-medium text-base line-clamp-1 mb-1 mt-2">
              {name}
            </h3>

            <div className="flex items-center mt-2">
              <div className="font-bold text-indigo-600">
                TND{" "}
                {finalPrice % 1 === 0
                  ? finalPrice.toFixed(0)
                  : finalPrice.toFixed(2)}
              </div>
              {discount && discount > 0 && (
                <span className="text-xs text-gray-500 line-through ml-2">
                  TND {price % 1 === 0 ? price.toFixed(0) : price.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <div className="mt-3">
            <motion.button
              onClick={handleAddToCart}
              disabled={stock <= 0}
              whileTap={{ scale: 0.95 }}
              className={`w-full py-2 px-3 rounded-lg text-sm font-medium text-white transition-all duration-200 flex items-center justify-center gap-1 ${
                stock <= 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : showAdded
                  ? "bg-green-500 hover:bg-green-600"
                  : isInCart
                  ? "bg-indigo-700 hover:bg-indigo-800"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {isAdding ? (
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 12a8 8 0 0116 0M12 8v4l3 3"
                    />
                  </svg>
                  <span>Adding...</span>
                </div>
              ) : stock <= 0 ? (
                "Out of Stock"
              ) : showAdded ? (
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
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
                  <span>Added to Cart</span>
                </div>
              ) : isInCart ? (
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span>Add Again</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span>Add to Cart</span>
                </div>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      onClick={onCardClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden transition-all duration-300 border border-gray-100 h-full flex flex-col group cursor-pointer"
      whileHover={{ y: -4, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)" }}
    >
      <div className={`relative ${cardSizes[size]} overflow-hidden`}>
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {discount && discount > 0 && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500 text-white shadow-sm">
              {discount}% OFF
            </span>
          </div>
        )}
        {stock <= 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <span className="text-white font-medium text-lg">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-3 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-1">
          <span className="text-xs font-medium text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-full">
            {brand}
          </span>
          <span className="text-xs font-medium text-gray-500 px-2 py-0.5 bg-gray-50 rounded-full">
            {region}
          </span>
        </div>
        <h3 className="text-gray-800 font-medium text-base line-clamp-1 mb-1 mt-1">
          {name}
        </h3>

        <div className="mt-auto pt-2 flex justify-between items-center">
          <div className="font-bold text-indigo-600">
            TND{" "}
            {finalPrice % 1 === 0
              ? finalPrice.toFixed(0)
              : finalPrice.toFixed(2)}
            {discount && discount > 0 && (
              <span className="text-xs text-gray-500 line-through ml-1">
                TND {price % 1 === 0 ? price.toFixed(0) : price.toFixed(2)}
              </span>
            )}
          </div>

          <motion.button
            onClick={handleAddToCart}
            disabled={stock <= 0}
            whileTap={{ scale: 0.95 }}
            className={`p-2 rounded-full flex-shrink-0 ${
              stock <= 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : showAdded
                ? "bg-green-500 text-white hover:bg-green-600"
                : isInCart
                ? "bg-indigo-700 text-white hover:bg-indigo-800"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {isAdding ? (
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 12a8 8 0 0116 0M12 8v4l3 3"
                />
              </svg>
            ) : showAdded ? (
              <svg
                className="w-5 h-5"
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
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default GiftCard;
