import React from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Contact: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're here to help. Reach out to us with any questions or concerns.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Email Contact Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-md overflow-hidden"
          >
            <div className="p-8">
              <div className="mb-6 flex justify-center">
                <div className="bg-indigo-100 p-4 rounded-full">
                  <svg
                    className="w-10 h-10 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
                Email Us
              </h2>
              <p className="text-gray-600 text-center mb-6">
                For all inquiries, please email us at:
              </p>
              <div className="flex justify-center mb-8">
                <a
                  href="mailto:pfe2025nsd@gmail.com"
                  className="text-lg font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  pfe2025nsd@gmail.com
                </a>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() =>
                    (window.location.href = "mailto:pfe2025nsd@gmail.com")
                  }
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 flex items-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Send Email
                </button>
              </div>
            </div>
          </motion.div>

          {/* FAQ Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-md overflow-hidden"
          >
            <div className="p-8">
              <div className="mb-6 flex justify-center">
                <div className="bg-indigo-100 p-4 rounded-full">
                  <svg
                    className="w-10 h-10 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
                Common Questions
              </h2>

              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-md font-semibold text-gray-900 mb-2">
                    How quickly will I receive a response?
                  </h3>
                  <p className="text-gray-600">
                    We typically respond to all inquiries within 24-48 hours
                    during business days.
                  </p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-md font-semibold text-gray-900 mb-2">
                    What information should I include in my email?
                  </h3>
                  <p className="text-gray-600">
                    Please include your name, order number (if applicable), and
                    a detailed description of your question or concern.
                  </p>
                </div>

                <div>
                  <h3 className="text-md font-semibold text-gray-900 mb-2">
                    Is there another way to contact support?
                  </h3>
                  <p className="text-gray-600">
                    Currently, email is our primary support channel. We're
                    working on adding more contact options soon.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl shadow-md overflow-hidden text-white"
        >
          <div className="p-8 md:p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Explore Our Products</h2>
            <p className="text-white/90 max-w-2xl mx-auto mb-6">
              Discover our collection of premium gift cards for any occasion.
            </p>
            <button
              onClick={() => navigate("/categories")}
              className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200"
            >
              Shop Gift Cards
            </button>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
