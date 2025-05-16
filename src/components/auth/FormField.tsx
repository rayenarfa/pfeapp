import React, { useState } from "react";
import { motion } from "framer-motion";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

interface FormFieldProps {
  id: string;
  name: string;
  type: string;
  placeholder: string;
  icon: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  autoComplete?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  name,
  type,
  placeholder,
  icon,
  value,
  onChange,
  error,
  required = true,
  autoComplete,
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  const variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div variants={variants} className="w-full relative">
      <div
        className={`flex items-center w-full border-2 rounded-lg px-4 py-3 transition-all ${
          focused
            ? "border-indigo-600"
            : error
            ? "border-red-500"
            : "border-gray-300"
        }`}
      >
        <span
          className={`mr-3 ${
            focused
              ? "text-indigo-600"
              : error
              ? "text-red-500"
              : "text-gray-400"
          }`}
        >
          {icon}
        </span>
        <input
          id={id}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          autoComplete={autoComplete}
          className="w-full outline-none bg-transparent text-gray-800"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? <IoMdEyeOff size={20} /> : <IoMdEye size={20} />}
          </button>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="text-red-500 text-sm mt-1 pl-2"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};

export default FormField;
