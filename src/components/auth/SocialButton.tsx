import React from "react";
import { motion } from "framer-motion";

interface SocialButtonProps {
  provider: "google" | "github" | "facebook" | "twitter" | "apple";
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

const SocialButton: React.FC<SocialButtonProps> = ({
  provider,
  onClick,
  disabled = false,
  className = "",
}) => {
  const providerConfig = {
    google: {
      name: "Google",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path
            d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z"
            fill="#4285F4"
          />
          <path
            d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3276 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50693 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z"
            fill="#34A853"
          />
          <path
            d="M5.5023 14.3003C5.00228 12.8099 5.00228 11.1961 5.5023 9.70575V6.61481H1.51158C-0.18551 10.0056 -0.18551 14.0004 1.51158 17.3912L5.5023 14.3003Z"
            fill="#FBBC04"
          />
          <path
            d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50732 9.70575C6.45986 6.86173 9.1142 4.74966 12.2401 4.74966Z"
            fill="#EA4335"
          />
        </svg>
      ),
      colors:
        "bg-white hover:bg-gray-50 text-gray-700",
    },
    github: {
      name: "GitHub",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.237 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      ),
      colors: "bg-gray-900 hover:bg-black text-white",
    },
    facebook: {
      name: "Facebook",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.642c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.736-.9 10.125-5.864 10.125-11.854z" />
        </svg>
      ),
      colors: "bg-[#1877F2] hover:bg-[#0C63D4] text-white",
    },
    twitter: {
      name: "Twitter",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      ),
      colors: "bg-[#1DA1F2] hover:bg-[#0D8BDB] text-white",
    },
    apple: {
      name: "Apple",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z" />
        </svg>
      ),
      colors: "bg-black hover:bg-gray-900 text-white",
    },
  };

  // Get the config for the selected provider
  const config = providerConfig[provider];

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative w-full flex items-center justify-center gap-2 sm:gap-3 py-3.5 px-3 sm:px-4 rounded-lg border border-gray-300 ${
        config.colors
      } text-sm sm:text-base font-medium transition-all duration-200 ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      } ${className} shadow-sm hover:shadow-md active:shadow-inner`}
    >
      {/* Background shine effect */}
      <div
        className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none"
        aria-hidden="true"
      >
        <motion.div
          initial={{ opacity: 0, x: "100%", y: "100%" }}
          animate={{
            opacity: [0, 0.5, 0],
            x: ["-100%", "100%"],
            y: ["-100%", "100%"],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
          }}
          className="absolute w-1/2 h-1/2 top-0 left-0 bg-gradient-to-br from-white/10 to-transparent blur-2xl"
        />
      </div>

      {/* Provider icon */}
      <span className="flex-shrink-0">{config.icon}</span>

      {/* Button text - with responsive text size */}
      <span>Continue with {config.name}</span>
    </motion.button>
  );
};

export default SocialButton;
