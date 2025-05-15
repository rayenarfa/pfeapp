import React from "react";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";

interface SocialLoginProps {
  onGoogleLogin: () => void;
  isLoading?: boolean;
}

const SocialLogin: React.FC<SocialLoginProps> = ({
  onGoogleLogin,
  isLoading,
}) => {
  const buttonVariants = {
    hover: { scale: 1.03 },
    tap: { scale: 0.97 },
  };

  return (
    <div className="w-full">
      <div className="flex items-center my-4">
        <div className="flex-grow h-px bg-gray-300"></div>
        <span className="px-4 text-sm text-gray-500">OR</span>
        <div className="flex-grow h-px bg-gray-300"></div>
      </div>

      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={onGoogleLogin}
        disabled={isLoading}
        className="flex items-center justify-center w-full border-2 border-gray-300 rounded-lg p-3 
                  hover:border-gray-400 transition-colors duration-300 font-medium"
      >
        <FcGoogle className="w-6 h-6 mr-2" />
        <span>{isLoading ? "Loading..." : "Continue with Google"}</span>
      </motion.button>
    </div>
  );
};

export default SocialLogin;
