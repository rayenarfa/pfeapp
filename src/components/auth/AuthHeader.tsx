import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
  linkText?: string;
  linkHref?: string;
  logoSrc?: string;
  className?: string;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  subtitle,
  linkText,
  linkHref,
  logoSrc = "/logo.png",
  className = "",
}) => {
  return (
    <div className={`text-center mb-8 ${className}`}>
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-md opacity-70"></div>
          <img
            src={logoSrc}
            alt="Logo"
            className="relative h-16 w-auto object-contain"
          />
        </motion.div>
      </div>

      {/* Title with highlight effect */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-3xl sm:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600"
      >
        {title}
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-gray-600 max-w-md mx-auto"
      >
        {subtitle}
      </motion.p>

      {/* Optional link */}
      {linkText && linkHref && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-4"
        >
          <Link
            to={linkHref}
            className="text-indigo-600 hover:text-indigo-500 font-medium text-sm transition-colors"
          >
            {linkText}
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default AuthHeader;
