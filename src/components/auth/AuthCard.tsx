import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  navigateToHome: () => void;
  alternateLink?: {
    text: string;
    to: string;
  };
}

const AuthCard: React.FC<AuthCardProps> = ({
  children,
  title,
  subtitle,
  icon,
  navigateToHome,
  alternateLink,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-white rounded-2xl shadow-xl overflow-hidden"
    >
      {/* Card content - improved padding for mobile */}
      <div className="p-4 sm:p-6 md:p-8">
        {/* Back button - improved for touch targets */}
        <button
          onClick={navigateToHome}
          className="group inline-flex items-center mb-4 sm:mb-6 text-gray-500 hover:text-indigo-600 transition-colors"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium">Back to Home</span>
        </button>

        {/* Header section - improved spacing for mobile */}
        <div className="mb-6 sm:mb-8">
          {icon && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1,
              }}
              className="mb-4 sm:mb-6 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-2 sm:p-3 inline-flex"
            >
              {icon}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
              {title}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              {subtitle}
            </p>
          </motion.div>
        </div>

        {/* Main content area */}
        <div className="mb-3 sm:mb-4">{children}</div>

        {/* Alternate link - improved for mobile touch targets */}
        {alternateLink && (
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-gray-600 text-sm sm:text-base">
              {alternateLink.text.includes("Sign Up")
                ? "Don't have an account?"
                : "Already have an account?"}
              <Link
                to={alternateLink.to}
                className="ml-2 font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                {alternateLink.text}
              </Link>
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AuthCard;
