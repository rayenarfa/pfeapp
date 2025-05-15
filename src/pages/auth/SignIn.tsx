import React, { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../../config/firebase/firebaseConfig";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase/firebaseConfig";
import { toast } from "sonner";
import { AlertCircle, LogIn, Mail, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

// Auth Components
import AuthLayout from "../../components/auth/AuthLayout";
import AuthCard from "../../components/auth/AuthCard";
import AuthForm from "../../components/auth/AuthForm";
import FormInput from "../../components/auth/FormInput";
import SocialButton from "../../components/auth/SocialButton";
import Button from "../../components/ui/button/Button";

interface CheckboxProps {
  label?: string;
  checked: boolean;
  className?: string;
  id?: string;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  id,
  onChange,
  className = "",
  disabled = false,
}) => {
  return (
    <label
      className={clsx(
        "flex items-center space-x-3 cursor-pointer text-gray-800 dark:text-gray-200",
        { "cursor-not-allowed opacity-50": disabled }
      )}
    >
      <input
        id={id}
        type="checkbox"
        className={clsx(
          "w-4 h-4 border-gray-300 rounded focus:ring-2 focus:ring-brand-500",
          "dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-brand-500 dark:checked:border-brand-500",
          "focus:ring-offset-0 focus:outline-none",
          className
        )}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      {label && <span className="text-sm font-medium">{label}</span>}
    </label>
  );
};

const SignIn: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [formTouched, setFormTouched] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect URL from the query parameters
  const redirectUrl =
    new URLSearchParams(location.search).get("redirect") || "/";

  // Form validation
  const emailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !formTouched || email === "";
  const passwordValid = password.length >= 6 || !formTouched || password === "";

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const role = userDoc.data().role;
          if (role === "admin") {
            navigate("/admin/products", { replace: true });
          } else {
            navigate("/home", { replace: true });
          }
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormTouched(true);

    // Validate form before submission
    if (!email || !password || !emailValid) {
      setErrorMessage("Please fill in all required fields correctly.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Check if the user is blocked
        if (userData.isBlocked) {
          // Sign out the user immediately
          await auth.signOut();
          setErrorMessage(
            "Your account has been suspended. Please contact us at pfe2025nsd@gmail.com to appeal."
          );
          toast.error(
            "Your account has been suspended. Please contact us at pfe2025nsd@gmail.com to appeal.",
            {
              duration: 6000,
            }
          );
          setIsLoading(false);
          navigate("/account-blocked");
          return;
        }

        const updateData: { lastLogin: Date; photoURL?: string } = {
          lastLogin: new Date(),
        };

        // If photoURL exists in Firebase Auth but not in Firestore, update it
        if (!userData.photoURL && user.photoURL) {
          updateData.photoURL = user.photoURL;
        }

        // If photoURL exists in Firestore but not in Firebase Auth, update Auth profile
        if (userData.photoURL && !user.photoURL) {
          try {
            await updateProfile(user, {
              photoURL: userData.photoURL,
            });
          } catch (error) {
            console.error("Error updating auth profile:", error);
          }
        }

        // Update user data in Firestore
        await setDoc(doc(db, "users", user.uid), updateData, { merge: true });

        const role = userData.role;
        toast.success(
          `Welcome ${
            role === "superAdmin"
              ? "Super Admin"
              : role === "admin"
              ? "Admin"
              : ""
          } ${user.displayName || userData.name || ""}! Redirecting...`,
          {
            duration: 4000,
            icon: "👋",
            style: {
              borderRadius: "10px",
              background: "#333",
              color: "#fff",
            },
          }
        );

        if (role === "superAdmin" || role === "admin") {
          navigate("/admin/products");
        } else {
          navigate(redirectUrl);
        }
      } else {
        // User exists in Firebase Auth but not in Firestore
        // Create a new user document and redirect to complete profile
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          name: user.displayName || "",
          displayName: user.displayName || "",
          photoURL: user.photoURL || "",
          role: "client",
          createdAt: new Date(),
          lastLogin: new Date(),
          isBlocked: false,
        });

        toast.success("Account created! Please complete your profile.", {
          duration: 4000,
        });
        navigate("/complete-profile");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error signing in:", error.message);

        if (error.message.includes("wrong-password")) {
          setErrorMessage("Invalid password. Please try again.");
        } else if (error.message.includes("user-not-found")) {
          setErrorMessage("No user found with this email. Please check again.");
        } else if (error.message.includes("invalid-email")) {
          setErrorMessage(
            "The email format is invalid. Please enter a valid email."
          );
        } else if (error.message.includes("too-many-requests")) {
          setErrorMessage(
            "Too many failed login attempts. Please try again later or reset your password."
          );
        } else {
          setErrorMessage("An error occurred. Please try again later.");
        }
        toast.error(errorMessage || "Sign-in failed", { duration: 4000 });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // New user - create account and redirect to complete profile
        await setDoc(userDocRef, {
          email: user.email,
          role: "client",
          name: user.displayName || "",
          displayName: user.displayName || "",
          photoURL: user.photoURL || "", // Explicitly save Google profile photo URL
          phoneNumber: user.phoneNumber || "",
          createdAt: new Date(),
          lastLogin: new Date(),
          isBlocked: false,
        });

        toast.success("Account created! Please complete your profile.", {
          duration: 4000,
        });
        navigate("/complete-profile");
        return;
      }

      // Existing user - check if blocked
      const userData = userDoc.data();

      // Check if the user is blocked
      if (userData.isBlocked) {
        // Sign out the user immediately
        await auth.signOut();
        setErrorMessage(
          "Your account has been suspended. Please contact us at pfe2025nsd@gmail.com to appeal."
        );
        toast.error(
          "Your account has been suspended. Please contact us at pfe2025nsd@gmail.com to appeal.",
          {
            duration: 6000,
          }
        );
        navigate("/account-blocked");
        return;
      }

      const updateData: { lastLogin: Date; photoURL?: string } = {
        lastLogin: new Date(),
      };

      // If photoURL is missing in Firestore but exists in Google Auth, update it
      if (!userData.photoURL && user.photoURL) {
        updateData.photoURL = user.photoURL;
      }

      // Update user data in Firestore
      await setDoc(userDocRef, updateData, { merge: true });

      const role = userData.role || "client";

      toast.success(
        `Welcome ${
          role === "superAdmin"
            ? "Super Admin"
            : role === "admin"
            ? "Admin"
            : ""
        } ${user.displayName || userData.name || ""}! Redirecting...`,
        {
          duration: 4000,
          icon: "👋",
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        }
      );

      if (role === "superAdmin" || role === "admin") {
        navigate("/admin/products");
      } else {
        navigate(redirectUrl);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error signing in with Google:", error.message);
        setErrorMessage("Error signing in with Google. Please try again.");
        toast.error("Error signing in with Google. Please try again.", {
          duration: 4000,
        });
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

  // Add onChange handlers with validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setFormTouched(true);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setFormTouched(true);
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Welcome Back"
        subtitle="Enter your credentials to access your account"
        icon={<LogIn className="w-8 h-8 text-white" />}
        navigateToHome={navigateToHome}
        alternateLink={{
          text: "Sign Up",
          to: "/signup",
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
              className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-lg border-l-4 border-red-500 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p>{errorMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AuthForm onSubmit={handleSignIn} className="space-y-5">
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

          <FormInput
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            icon={<Lock className="w-5 h-5" />}
            value={password}
            onChange={handlePasswordChange}
            error={
              !passwordValid && formTouched
                ? "Password must be at least 6 characters"
                : ""
            }
            required
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Checkbox
                checked={isChecked}
                onChange={setIsChecked}
                className="text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:border-gray-600"
                id="remember-me"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
              >
                Remember me
              </label>
            </div>
            <motion.div
              whileHover={{ x: 2 }}
              whileTap={{ x: -2 }}
              className="transition-transform"
            >
              <a
                href="/reset-password"
                className="text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200"
              >
                Forgot password?
              </a>
            </motion.div>
          </div>

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
              disabled={isLoading}
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
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center">
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign in
                </span>
              )}
            </Button>
          </motion.div>
        </AuthForm>

        <div className="relative py-4 sm:py-5 mt-4 sm:mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-xs sm:text-sm">
            <span className="px-2 text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-4 sm:mt-6">
          <SocialButton
            provider="google"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          />
        </div>
      </AuthCard>
    </AuthLayout>
  );
};

export default SignIn;
