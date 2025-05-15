import React from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { motion } from "framer-motion";

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-indigo-900 mb-4">
            About SharePay
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tunisia's first dedicated gift card marketplace - bridging the gap between local payment options and global digital services.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex flex-col justify-center"
          >
            <h2 className="text-3xl font-bold text-indigo-800 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-700 mb-6">
              At SharePay, we're on a mission to bridge the digital divide by providing Tunisians with seamless access to the global digital economy through an innovative gift card marketplace.
            </p>
            <p className="text-lg text-gray-700">
              We believe that geographic location and payment limitations shouldn't restrict anyone's ability to participate in the digital world. SharePay exists to tear down these barriers, creating an inclusive digital future for all Tunisians.
            </p>
          </motion.div>
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="bg-indigo-600 p-6">
              <h3 className="text-2xl font-bold text-white">The Digital Economy Challenge</h3>
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-indigo-500 mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-700">Limited access to international payment methods like PayPal or major credit cards with foreign currency capabilities</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-indigo-500 mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-700">Regulatory limitations on foreign currency transactions restricting direct purchases from international platforms</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-indigo-500 mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-700">Growing demand for digital goods and services despite payment limitations</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-indigo-500 mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-700">A young, tech-savvy population eager to participate in global digital markets</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-20"
        >
          <h2 className="text-3xl font-bold text-indigo-800 mb-8 text-center">The SharePay Solution</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Local Payment Integration</h3>
              <p className="text-gray-600">
                SharePay integrates multiple locally available payment methods including Tunisian bank transfers, mobile payment services like D17, e-wallets, and cash-on-delivery options.
              </p>
            </div>
            <div className="text-center p-6 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Comprehensive Gift Card Catalog</h3>
              <p className="text-gray-600">
                Our centralized marketplace offers a wide variety of gift cards for gaming platforms, streaming services, app stores, e-commerce platforms, and educational services in various denominations.
              </p>
            </div>
            <div className="text-center p-6 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Delivery System</h3>
              <p className="text-gray-600">
                Our platform implements a secure, automated system for delivering gift card codes instantly after payment verification, with encrypted storage and an in-platform vault.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="bg-indigo-800 rounded-xl shadow-lg p-8 text-white"
        >
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Why Choose SharePay?</h2>
            <div className="space-y-6">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-indigo-300 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h3 className="text-xl font-semibold text-indigo-200">Accessibility</h3>
                  <p className="text-indigo-100">
                    Unlike global platforms that require international payment methods, SharePay makes digital gift cards accessible to all Tunisians through locally available payment options.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <svg className="w-6 h-6 text-indigo-300 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h3 className="text-xl font-semibold text-indigo-200">Convenience</h3>
                  <p className="text-indigo-100">
                    Our centralized marketplace eliminates the need to navigate multiple platforms, offering a comprehensive selection of gift cards in one secure location.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <svg className="w-6 h-6 text-indigo-300 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h3 className="text-xl font-semibold text-indigo-200">Security</h3>
                  <p className="text-indigo-100">
                    Say goodbye to unreliable resellers and informal channels. SharePay provides a secure, transparent platform with encrypted delivery and storage of your digital assets.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Ready to join the global digital economy?</h2>
            <p className="mt-4 text-xl text-gray-600">SharePay is here to help you access your favorite digital platforms and services.</p>
          </div>
          <div className="flex justify-center">
            <a href="/contact" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Contact Us
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;