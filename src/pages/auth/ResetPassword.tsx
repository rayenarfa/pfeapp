import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { sendPasswordResetEmail } from "../../services/auth/authService";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Mail, KeyRound } from "lucide-react";

// Auth Components
import AuthLayout from "../../components/auth/AuthLayout";
import AuthCard from "../../components/auth/AuthCard";
import AuthForm from "../../components/auth/AuthForm";
import FormInput from "../../components/auth/FormInput";
import Button from "../../components/ui/button/Button";

/**
 * Reset Password Request Page
 * Allows users to request a password reset email
 */
const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formTouched, setFormTouched] = useState(false);
  const navigate = useNavigate();

  // Form validation
  const emailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !formTouched || email === "";

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setFormTouched(true);
  };

  /**
   * Handles the password reset request form submission
   * Sends a password reset email to the provided email address
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await sendPasswordResetEmail(email);
      setIsSubmitted(true);
      toast.success("Password reset email sent! Please check your inbox.");
    } catch (error) {
      console.error("Failed to send reset email:", error);
      
      // Handle different error types
      if (error instanceof Error) {
        // Check if it's a Firebase auth error
        if (error.message.includes("user-not-found")) {
          setErrorMessage("No account found with this email address.");
        } else if (error.message.includes("invalid-email")) {
          setErrorMessage("Invalid email format.");
        } else {
          setErrorMessage(`Failed to send reset email: ${error.message}`);
        }
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToHome = () => {
    navigate("/");
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.03,
      boxShadow: "0px 4px 20px rgba(79, 70, 229, 0.2)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
    tap: { scale: 0.97 },
    disabled: {
      opacity: 0.7,
      scale: 1,
      boxShadow: "none",
    },
  };

  return (
    <AuthLayout>
      <AuthCard
        title={isSubmitted ? "Email Sent" : "Reset Your Password"}
        subtitle={isSubmitted ? "Check your inbox" : "We'll send you a reset link"}
        icon={<KeyRound className="w-8 h-8 text-white" />}
        navigateToHome={navigateToHome}
        alternateLink={{
          text: "Sign In",
          to: "/signin",
        }}
      >
        {/* Error message */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mb-6 p-4 bg-red-100 text-red-700 text-sm rounded-lg border-l-4 border-red-500 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p>{errorMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {isSubmitted ? (
          <div className="text-center">
            <div className="mb-6 text-green-500 flex justify-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-16 w-16" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <p className="mb-4 text-gray-600">
              We've sent instructions to:
              <br />
              <span className="font-semibold">{email}</span>
            </p>
            <p className="mb-6 text-gray-500 text-sm">
              Please check your inbox and spam folder. The link in the email
              will expire after 1 hour.
            </p>
            <div className="flex flex-col space-y-3">
              <motion.div
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                className="overflow-hidden rounded-lg"
              >
                <Button
                  className="w-full bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
                  size="md"
                  onClick={() => {
                    setEmail("");
                    setIsSubmitted(false);
                  }}
                >
                  Reset a different email
                </Button>
              </motion.div>
              
              <motion.div
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                className="overflow-hidden rounded-lg"
              >
                <Button
                  className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-800 text-white"
                  size="md"
                  onClick={() => navigate("/signin")}
                >
                  Return to Sign In
                </Button>
              </motion.div>
            </div>
          </div>
        ) : (
          <AuthForm onSubmit={handleSubmit}>
            <FormInput
              id="email"
              name="email"
              type="email"
              placeholder="Email Address"
              icon={<Mail className="w-5 h-5" />}
              value={email}
              onChange={handleEmailChange}
              error={
                !emailValid && formTouched
                  ? "Please enter a valid email address"
                  : ""
              }
              required
              autoComplete="email"
            />

            <motion.div
              variants={buttonVariants}
              initial="initial"
              whileHover={isLoading ? "disabled" : "hover"}
              whileTap={isLoading ? "disabled" : "tap"}
              animate={isLoading ? "disabled" : "initial"}
              className="overflow-hidden rounded-lg mt-6"
            >
              <Button
                className="w-full py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-800 text-white text-sm sm:text-base font-medium rounded-lg flex items-center justify-center shadow-md disabled:opacity-70 transition-all duration-300 border border-indigo-700"
                size="md"
                disabled={isLoading || !email || !emailValid}
                type="submit"
                as="button"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-3 -ml-1 animate-spin"
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
                    Sending Reset Link...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Mail className="w-5 h-5 mr-2" />
                    Send Reset Link
                  </span>
                )}
              </Button>
            </motion.div>
          </AuthForm>
        )}
      </AuthCard>
    </AuthLayout>
  );
};

export default ResetPassword;
