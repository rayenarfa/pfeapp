import React from "react";
import { motion } from "framer-motion";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Background gradient - improved for mobile */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 -z-10" />

      {/* Animated background shapes - optimized for mobile */}
      <div className="absolute inset-0 overflow-hidden -z-5">
        {/* Shape 1 - reduced size and blur on mobile */}
        <motion.div
          initial={{ opacity: 0.6, x: -100, y: -100 }}
          animate={{
            opacity: 0.3,
            x: -80,
            y: -80,
            transition: {
              repeat: Infinity,
              repeatType: "reverse",
              duration: 20,
              ease: "easeInOut",
            },
          }}
          className="absolute w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-blue-300 blur-2xl sm:blur-3xl -top-[200px] sm:-top-[300px] -left-[200px] sm:-left-[300px]"
        />
        {/* Shape 2 - reduced size and blur on mobile */}
        <motion.div
          initial={{ opacity: 0.6, x: 100, y: 100 }}
          animate={{
            opacity: 0.3,
            x: 80,
            y: 80,
            transition: {
              repeat: Infinity,
              repeatType: "reverse",
              duration: 25,
              ease: "easeInOut",
            },
          }}
          className="absolute w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-purple-300 blur-2xl sm:blur-3xl -bottom-[200px] sm:-bottom-[300px] -right-[200px] sm:-right-[300px]"
        />
        {/* Shape 3 - reduced size and blur on mobile */}
        <motion.div
          initial={{ opacity: 0.4, scale: 1 }}
          animate={{
            opacity: 0.2,
            scale: 1.2,
            transition: {
              repeat: Infinity,
              repeatType: "reverse",
              duration: 15,
              ease: "easeInOut",
            },
          }}
          className="absolute w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] rounded-full bg-indigo-300 blur-2xl sm:blur-3xl top-[50%] left-[10%] transform -translate-y-1/2"
        />
      </div>

      {/* Main container - improved mobile padding and spacing */}
      <div className="relative z-10 w-full max-w-screen-xl mx-auto px-4 py-4 sm:py-8 md:py-12 flex flex-col md:flex-row items-center md:items-stretch justify-center gap-4 sm:gap-8 md:gap-12">
        {/* Left side - will be hidden on mobile */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hidden lg:flex lg:w-1/2 flex-col justify-center pr-8"
        >
          <div className="max-w-md">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl font-bold mb-6 text-gray-900">
                Welcome to{" "}
                <span className="text-indigo-600">
                  SharePay
                </span>
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Your premier destination for discovering and purchasing gift
                cards for any occasion.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col gap-4"
            >
              {/* Feature points */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-indigo-600 "
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className=" font-medium mb-1">
                    Premium Gift Cards
                  </h3>
                  <p className="text-gray-600  text-sm">
                    Discover a wide selection of gift cards from top brands
                    worldwide.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-indigo-600 "
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className=" font-medium mb-1">
                    Instant Delivery
                  </h3>
                  <p className="text-gray-600  text-sm">
                    Get your digital gift cards delivered instantly to your
                    email.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-indigo-600 "
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className=" font-medium mb-1">
                    Secure & Verified
                  </h3>
                  <p className="text-gray-600  text-sm">
                    All gift cards are guaranteed authentic and securely
                    processed.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right side - auth form container - improved for mobile */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-full sm:max-w-md lg:w-1/2"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
