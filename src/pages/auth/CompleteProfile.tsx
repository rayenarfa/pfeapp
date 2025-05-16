import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../config/firebase/firebaseConfig";
import { db } from "../../config/firebase/firebaseConfig";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import Button from "../../components/ui/button/Button";
import { Home, ChevronRight, User, Phone, Save } from "lucide-react";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";

interface LabelProps {
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

const Label: React.FC<LabelProps> = ({ htmlFor, children, className }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={twMerge(
        // Default classes that apply by default
        "mb-1.5 block text-sm font-medium text-gray-700",

        // User-defined className that can override the default margin
        className
      )}
    >
      {children}
    </label>
  );
};

interface InputProps {
  type?: "text" | "number" | "email" | "password" | "date" | "time" | string;
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  min?: string;
  max?: string;
  step?: number;
  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({
  type = "text",
  id,
  name,
  placeholder,
  value,
  onChange,
  className = "",
  min,
  max,
  step,
  disabled = false,
  success = false,
  error = false,
  hint,
}) => {
  let inputClasses = ` h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring ${className}`;

  if (disabled) {
    inputClasses += ` text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed`;
  } else if (error) {
    inputClasses += `  border-error-500 focus:border-error-300 focus:ring-error-500/20`;
  } else if (success) {
    inputClasses += `  border-success-500 focus:border-success-300 focus:ring-success-500/20`;
  } else {
    inputClasses += ` bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20`;
  }

  return (
    <div className="relative">
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={inputClasses}
      />

      {hint && (
        <p
          className={`mt-1.5 text-xs ${
            error
              ? "text-error-500"
              : success
              ? "text-success-500"
              : "text-gray-500"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

const CompleteProfile: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [initialDataLoaded, setInitialDataLoaded] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        // If no user is signed in, redirect to sign in page
        navigate("/signin", { replace: true });
        return;
      }

      // Fetch existing user data
      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Pre-fill the form with existing data
          setName(userData.name || user.displayName || "");
          setPhoneNumber(userData.phoneNumber || "");
        }

        setInitialDataLoaded(true);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setInitialDataLoaded(true);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate inputs
    if (!name.trim()) {
      setErrorMessage("Please enter your name");
      return;
    }

    if (!phoneNumber.trim()) {
      setErrorMessage("Please enter your phone number");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No user is currently signed in");
      }

      // Update Firestore document for the user
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        name: name,
        phoneNumber: phoneNumber,
        profileCompleted: true,
      });

      toast.success("Profile updated successfully!");
      navigate("/home");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error updating profile:", error.message);
        setErrorMessage("Error updating profile. Please try again.");
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToHome = () => {
    navigate("/");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  // If we're still loading initial data, show a loading indicator
  if (!initialDataLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <svg
            className="w-10 h-10 mx-auto animate-spin text-indigo-600"
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
          <p className="mt-4 text-indigo-600">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 sm:p-6 md:p-8">
      {/* Background design elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-16 left-10 w-32 h-32 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-36 h-36 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-28 h-28 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md mx-auto backdrop-blur-sm bg-white/90 rounded-2xl shadow-lg overflow-hidden z-10"
      >
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

        {/* Home button integrated into card header */}
        <div className="relative px-6 sm:px-8 pt-6 pb-2 flex justify-between items-center">
          <motion.button
            onClick={navigateToHome}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="group flex items-center text-indigo-600 text-sm font-medium transition-all duration-200 hover:text-indigo-800"
          >
            <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
            <span>Home</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Link
              to="/profile"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center group"
            >
              My Profile
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </motion.div>
        </div>

        <div className="px-6 sm:px-8 py-6 sm:py-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-5 sm:space-y-6"
          >
            <motion.div variants={itemVariants} className="text-center">
              <div className="mb-3 mx-auto bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-indigo-600" />
              </div>
              <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-gray-900">
                Complete Your Profile
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Please provide the following information to complete your
                account setup
              </p>
            </motion.div>

            {/* Error message display */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 text-sm bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md"
              >
                {errorMessage}
              </motion.div>
            )}

            <motion.form
              variants={containerVariants}
              onSubmit={handleSubmit}
              className="space-y-4 sm:space-y-5"
            >
              {/* Name field */}
              <motion.div variants={itemVariants}>
                <Label className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium mb-1.5 block">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
                  </div>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 w-full border-gray-300 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 rounded-lg shadow-sm dark:border-gray-600 dark:bg-gray-700/50 dark:text-white transition-all duration-200"
                  />
                </div>
              </motion.div>

              {/* Phone number field */}
              <motion.div variants={itemVariants}>
                <Label className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium mb-1.5 block">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Phone className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
                  </div>
                  <Input
                    type="tel"
                    placeholder="+216 21123123"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-10 w-full border-gray-300 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 rounded-lg shadow-sm dark:border-gray-600 dark:bg-gray-700/50 dark:text-white transition-all duration-200"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-2">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Button
                    className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-base font-medium rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:hover:shadow-md"
                    size="md"
                    disabled={isLoading}
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
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Save className="w-5 h-5 mr-2" />
                        Save Profile
                      </span>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </motion.form>

            <motion.p
              variants={itemVariants}
              className="mt-5 text-sm text-center text-gray-600"
            >
              Want to complete this later?{" "}
              <motion.span whileHover={{ scale: 1.05 }}>
                <Link
                  to="/home"
                  className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  Skip for now
                </Link>
              </motion.span>
            </motion.p>
          </motion.div>
        </div>
      </motion.div>

      {/* Add animation styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `,
        }}
      />
    </div>
  );
};

export default CompleteProfile;
