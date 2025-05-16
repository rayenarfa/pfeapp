import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../../config/firebase/firebaseConfig";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { db } from "../../config/firebase/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { LogIn, User, Mail, Lock, Phone } from "lucide-react";

// Auth Components
import AuthLayout from "../../components/auth/AuthLayout";
import AuthCard from "../../components/auth/AuthCard";
import AuthForm from "../../components/auth/AuthForm";
import FormInput from "../../components/auth/FormInput";
import SocialButton from "../../components/auth/SocialButton";
import Button from "../../components/ui/button/Button";

const SignUp: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formTouched, setFormTouched] = useState<boolean>(false);
  const navigate = useNavigate();

  // Form validation
  const emailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !formTouched || email === "";
  const passwordValid = password.length >= 6 || !formTouched || password === "";

  // Add onChange handlers with validation
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setFormTouched(true);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setFormTouched(true);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setFormTouched(true);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
    setFormTouched(true);
  };

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

  // Google Sign Up
  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userDocRef = doc(db, "users", user.uid);

      // Check if the user already exists in Firestore
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        // Create a new user document with all required fields
        await setDoc(userDocRef, {
          email: user.email,
          name: user.displayName || "",
          displayName: user.displayName || "",
          photoURL: user.photoURL || "", // Explicitly save Google profile photo URL
          phoneNumber: user.phoneNumber || "",
          role: "client", // Default role for new users
          createdAt: new Date(),
          lastLogin: new Date(),
        });

        toast.success("Account created! Please complete your profile.", {
          duration: 4000,
        });
        navigate("/complete-profile");
        return;
      }

      // Existing user - update last login time and other fields if necessary
      const userData = userDoc.data();
      const updateData: { lastLogin: Date; photoURL?: string } = {
        lastLogin: new Date(),
      };

      // If photoURL is missing in Firestore but exists in Google Auth, update it
      if (!userData.photoURL && user.photoURL) {
        updateData.photoURL = user.photoURL;
      }

      // Update user data
      await setDoc(userDocRef, updateData, { merge: true });

      const role = userData.role || "client";

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

      toast.success(
        `Welcome ${role === "admin" ? "Admin" : ""} ${
          user.displayName || userData.name || ""
        }! Redirecting...`,
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

      if (role === "admin") {
        navigate("/admin/products");
      } else {
        navigate("/home");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error signing up with Google:", error.message);
        setErrorMessage("Error signing up with Google. Please try again.");
        toast.error("Error signing up with Google. Please try again.", {
          duration: 4000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Email and Password Sign-Up
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormTouched(true);

    // Validate inputs
    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !emailValid ||
      !passwordValid
    ) {
      setErrorMessage("Please fill in all required fields correctly.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update display name in Firebase Auth
      await updateProfile(user, {
        displayName: name,
      });

      // Create Firestore document for the new user with all required fields
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        email: user.email,
        name: name,
        displayName: name, // Sync with SignIn component
        photoURL: user.photoURL || "", // May be null for email/password signup
        role: "client",
        createdAt: new Date(),
        lastLogin: new Date(),
      });

      toast.success(`Welcome ${name}! Redirecting...`, {
        duration: 4000,
        icon: "👋",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
      navigate("/home");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error signing up:", error.message);

        // Custom error handling for Firebase errors
        if (error.message.includes("auth/weak-password")) {
          setErrorMessage("Password should be at least 6 characters.");
        } else if (error.message.includes("auth/email-already-in-use")) {
          setErrorMessage(
            "This email is already in use. Please choose another one."
          );
        } else if (error.message.includes("auth/invalid-email")) {
          setErrorMessage(
            "The email format is invalid. Please enter a valid email."
          );
        } else {
          setErrorMessage("Error signing up. Please try again.");
        }

        toast.error(errorMessage || "Sign-up failed", { duration: 4000 });
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
        title="Create Account"
        subtitle="Join us and start your journey today"
        icon={<LogIn className="w-8 h-8 text-white" />}
        navigateToHome={navigateToHome}
        alternateLink={{
          text: "Sign In",
          to: "/signin",
        }}
      >
        {/* Error message display */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 mb-6 text-sm bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md"
          >
            {errorMessage}
          </motion.div>
        )}

        <AuthForm onSubmit={handleEmailSignUp} className="space-y-5">
          {/* Name field */}
          <FormInput
            id="name"
            name="name"
            type="text"
            placeholder="Full Name"
            icon={<User className="w-5 h-5" />}
            value={name}
            onChange={handleNameChange}
            error={name.trim() === "" && formTouched ? "Name is required" : ""}
            required
            autoComplete="name"
          />

          {/* Email field */}
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

          {/* Phone number field - Temporarily disabled */}
          <div className="opacity-50">
            <FormInput
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              placeholder="Phone Number (Coming Soon)"
              icon={<Phone className="w-5 h-5" />}
              value={phoneNumber}
              onChange={handlePhoneChange}
              required={false}
              autoComplete="tel"
              disabled
            />
          </div>

          {/* Password field */}
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
            autoComplete="new-password"
          />

          <p className="text-xs text-gray-500">
            Password must be at least 6 characters long
          </p>

          <motion.div
            variants={buttonVariants}
            initial="initial"
            whileHover={isLoading ? "disabled" : "hover"}
            whileTap={isLoading ? "disabled" : "tap"}
            animate={isLoading ? "disabled" : "initial"}
            className="overflow-hidden rounded-lg mt-6"
          >
            <Button
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-sm sm:text-base font-medium rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:hover:shadow-md"
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
                  Signing up...
                </span>
              ) : (
                <span className="flex items-center">
                  <LogIn className="w-5 h-5 mr-2" />
                  Create Account
                </span>
              )}
            </Button>
          </motion.div>
        </AuthForm>

        <div className="relative py-4 sm:py-5 mt-4 sm:mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-xs sm:text-sm">
            <span className="px-2 text-gray-500 bg-white">
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-4 sm:mt-6">
          <SocialButton
            provider="google"
            onClick={handleGoogleSignUp}
            disabled={isLoading}
          />
        </div>
      </AuthCard>
    </AuthLayout>
  );
};

export default SignUp;
