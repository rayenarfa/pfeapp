import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../config/firebase/firebaseConfig";
import { ShieldAlert, Mail, Home, History } from "lucide-react";
import { motion } from "framer-motion";
import Button from "../../components/ui/button/Button";

const AccountBlocked: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Ensure user is signed out
    auth.signOut();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
      >
        {/* Red warning bar */}
        <div className="h-2 bg-red-500" />

        <div className="p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: 0.2,
              }}
              className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6"
            >
              <ShieldAlert className="h-10 w-10 text-red-500" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-gray-900 dark:text-white mb-3"
            >
              Account Suspended
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 dark:text-gray-300 mb-8"
            >
              Your account has been suspended due to a violation of our terms of
              service or community guidelines.
            </motion.p>

            <div className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                What can you do?
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <Mail className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span>
                    Contact us at{" "}
                    <a
                      href="mailto:pfe2025nsd@gmail.com"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      pfe2025nsd@gmail.com
                    </a>{" "}
                    to appeal this decision
                  </span>
                </li>
                <li className="flex items-start">
                  <History className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span>
                    Please include your account details and an explanation in
                    your message
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => navigate("/")}
              >
                <Home className="h-4 w-4 mr-2" />
                Return to Home
              </Button>

              <Button
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                onClick={() =>
                  (window.location.href =
                    "mailto:pfe2025nsd@gmail.com?subject=Account%20Suspension%20Appeal")
                }
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AccountBlocked;
