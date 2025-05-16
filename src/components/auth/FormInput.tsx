import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

interface FormInputProps {
  id: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  error?: string;
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
  className?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  id,
  name,
  type: initialType,
  placeholder,
  value,
  onChange,
  icon,
  error,
  required = false,
  autoComplete,
  disabled = false,
  className = "",
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const type =
    initialType === "password" && showPassword ? "text" : initialType;

  // Class names based on state - improved for mobile touch
  const inputClass = `w-full px-3 sm:px-4 py-3 ${
    icon ? "pl-9 sm:pl-10" : ""
  } rounded-lg 
    bg-gray-50 
    border ${
      error
        ? "border-red-300"
        : isFocused
        ? "border-indigo-500"
        : "border-gray-300"
    } 
    text-sm sm:text-base text-gray-900 
    placeholder-gray-400
    focus:outline-none focus:ring-2 ${
      error
        ? "focus:ring-red-100"
        : "focus:ring-indigo-100"
    }
    transition-all duration-200
    ${disabled ? "opacity-60 cursor-not-allowed" : ""}
    ${className}`;

  return (
    <div className="mb-3 sm:mb-4">
      <div className="relative">
        {/* Icon - adjusted for mobile */}
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-3 pointer-events-none">
            <motion.div
              animate={{
                color: error ? "#ef4444" : isFocused ? "#6366f1" : "#9ca3af",
              }}
              className="text-gray-400"
            >
              {icon}
            </motion.div>
          </div>
        )}

        {/* Input element */}
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={inputClass}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${id}-error` : undefined}
        />

        {/* Password toggle button - larger touch target for mobile */}
        {initialType === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-1" // Added padding for larger touch target
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </motion.div>
          </button>
        )}

        {/* Error indicator - positioned better for mobile */}
        {error && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-red-500"
            >
              <AlertCircle size={18} />
            </motion.div>
          </div>
        )}
      </div>

      {/* Error message - improved for mobile */}
      <AnimatePresence>
        {error && (
          <motion.div
            id={`${id}-error`}
            initial={{ opacity: 0, height: 0, y: -5 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-1 text-red-500 text-xs sm:text-sm flex items-center gap-1"
          >
            <AlertCircle size={14} className="inline flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FormInput;
