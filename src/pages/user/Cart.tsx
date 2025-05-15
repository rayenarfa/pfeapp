import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { useCart } from "../../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "../../config/firebase/firebaseConfig";
import Footer from "../../components/layout/Footer";

const CartPage: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart, totalPrice } = useCart();
  const [showConfirmation, setShowConfirmation] = useState<string | null>(null);
  const [isCheckingOut] = useState(false);
  const navigate = useNavigate();

  const handleRemove = (id: string) => {
    setShowConfirmation(id);
  };

  const confirmRemove = (id: string) => {
    removeFromCart(id);
    setShowConfirmation(null);
  };

  const handleCheckoutClick = () => {
    if (!auth.currentUser) {
      navigate("/signin?redirect=/checkout");
      return;
    }

    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Navbar />
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 flex-grow">
        <main className="max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4 sm:mb-8 text-center bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600"
            >
              Your Shopping Cart
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl shadow-xl overflow-hidden backdrop-blur-sm"
            >
              {cartItems.length === 0 ? (
                <div className="p-6 sm:p-16 text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-gray-400 mb-6"
                  >
                    <svg
                      className="w-16 sm:w-28 h-16 sm:h-28 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="text-xl sm:text-2xl font-medium text-gray-900 mb-3"
                  >
                    Your cart is empty
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="text-gray-500 mb-6 sm:mb-8 text-sm sm:text-base"
                  >
                    Looks like you haven't added any items to your cart yet.
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <Link
                      to="/"
                      className="inline-flex items-center px-5 sm:px-6 py-3 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-full shadow-md text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover:shadow-lg"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
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
                      Start Shopping
                    </Link>
                  </motion.div>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-gray-200">
                    <AnimatePresence>
                      {cartItems.map((item, index) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -300 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 hover:bg-gray-50 transition-colors duration-200 relative group"
                        >
                          <div className="flex-shrink-0 w-24 sm:w-24 h-24 sm:h-24 bg-gray-200 rounded-lg overflow-hidden">
                            <motion.img
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.3 }}
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 text-center sm:text-left">
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
                              {item.name}
                            </h3>
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-indigo-600 font-bold text-sm sm:text-base"
                            >
                              TND{" "}
                              {item.price % 1 === 0
                                ? item.price.toFixed(0)
                                : item.price.toFixed(2)}
                            </motion.p>
                            <p className="text-gray-500 text-xs sm:text-sm mt-1">
                              Item total: TND{" "}
                              {(item.price * item.quantity) % 1 === 0
                                ? (item.price * item.quantity).toFixed(0)
                                : (item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                            <div className="flex items-center border border-gray-200 rounded-full shadow-sm hover:shadow transition-shadow duration-200">
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    Math.max(1, item.quantity - 1)
                                  )
                                }
                                className="p-1 sm:p-2 hover:bg-gray-100 transition-colors duration-200 text-gray-500 hover:text-indigo-600 w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center rounded-l-full"
                                disabled={item.quantity <= 1}
                              >
                                <svg
                                  className={`w-4 h-4 ${
                                    item.quantity <= 1 ? "text-gray-300" : ""
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 12H4"
                                  />
                                </svg>
                              </motion.button>
                              <motion.span
                                key={item.quantity}
                                initial={{ scale: 1 }}
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.3 }}
                                className="px-2 sm:px-4 font-medium w-8 text-center"
                              >
                                {item.quantity}
                              </motion.span>
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="p-1 sm:p-2 hover:bg-gray-100 transition-colors duration-200 text-gray-500 hover:text-indigo-600 w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center rounded-r-full"
                              >
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
                                    d="M12 4v16m8-8H4"
                                  />
                                </svg>
                              </motion.button>
                            </div>
                            {showConfirmation === item.id ? (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex space-x-2"
                              >
                                <button
                                  onClick={() => confirmRemove(item.id)}
                                  className="px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-colors"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setShowConfirmation(null)}
                                  className="px-3 py-1 bg-gray-200 text-gray-800 text-xs rounded-md hover:bg-gray-300 transition-colors"
                                >
                                  No
                                </button>
                              </motion.div>
                            ) : (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleRemove(item.id)}
                                className="text-red-500 hover:text-red-700 transition-colors duration-200 text-sm sm:text-base flex items-center bg-white/80 hover:bg-red-50 px-2 py-1 rounded-md"
                              >
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                Remove
                              </motion.button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <div className="bg-gray-50 p-4 sm:p-6 border-t border-gray-200">
                    <div className="space-y-4">
                      {/* Order summary section */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Subtotal (
                            {cartItems.reduce(
                              (acc, item) => acc + item.quantity,
                              0
                            )}{" "}
                            items)
                          </span>
                          <span className="text-sm font-medium">
                            TND{" "}
                            {totalPrice % 1 === 0
                              ? totalPrice.toFixed(0)
                              : totalPrice.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Shipping
                          </span>
                          <span className="text-sm font-medium text-green-600">
                            Free
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-base sm:text-lg font-medium text-gray-900">
                            Total
                          </span>
                          <motion.span
                            key={totalPrice}
                            initial={{ scale: 1 }}
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 0.3 }}
                            className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600"
                          >
                            TND{" "}
                            {totalPrice % 1 === 0
                              ? totalPrice.toFixed(0)
                              : totalPrice.toFixed(2)}
                          </motion.span>
                        </div>
                      </div>

                      <div className="pt-2">
                        {/* Coupon code input with enhanced styling */}
                        <div className="flex mt-2 mb-4 shadow-sm">
                          <input
                            type="text"
                            placeholder="Coupon code"
                            className="flex-1 p-2 sm:p-3 text-sm border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                          />
                          <button className="bg-gray-200 hover:bg-gray-300 transition-colors text-sm text-gray-800 font-medium px-4 rounded-r-md hover:text-indigo-700">
                            Apply
                          </button>
                        </div>
                        <motion.button
                          whileHover={{
                            scale: 1.02,
                            boxShadow: "0px 8px 15px rgba(99, 102, 241, 0.2)",
                          }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleCheckoutClick}
                          disabled={isCheckingOut}
                          className={`relative mt-2 w-full py-3 px-4 text-white font-medium text-sm sm:text-base rounded-full flex items-center justify-center transition-all duration-300 shadow-lg
    ${
      isCheckingOut
        ? "bg-indigo-400 cursor-not-allowed opacity-80"
        : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl"
    }`}
                        >
                          {isCheckingOut ? (
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
                              <span>Proceed to Checkout</span>
                              <svg
                                className="w-5 h-5 ml-2 transition-transform duration-200 group-hover:translate-x-1"
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
                        <div className="mt-3 flex items-center justify-center">
                          <div className="flex items-center text-xs text-gray-500 space-x-1 bg-green-50 px-3 py-1 rounded-full">
                            <svg
                              className="w-4 h-4 text-green-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                            <span>Secure checkout</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-t border-gray-200 p-4 flex justify-between items-center">
                    <Link
                      to="/"
                      className="inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium text-indigo-600 transition-all duration-300 hover:text-indigo-700 hover:translate-x-[-4px] group"
                    >
                      <svg
                        className="w-4 h-4 group-hover:translate-x-[-2px] transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                      </svg>
                      Continue Shopping
                    </Link>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default CartPage;
