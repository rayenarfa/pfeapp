import React from "react";
import { motion } from "framer-motion";
import { NavigateFunction } from "react-router-dom";

interface HeroProps {
  navigate: NavigateFunction;
}

const Hero: React.FC<HeroProps> = ({ navigate }) => {
  return (
    <section className="pt-6 pb-8 md:pt-10 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 shadow-xl">
          <div className="absolute inset-0 opacity-20 mix-blend-overlay">
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <pattern
                  id="small-grid"
                  width="10"
                  height="10"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 10 0 L 0 0 0 10"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#small-grid)" />
            </svg>
          </div>

          <div className="relative px-6 py-12 sm:px-12 sm:py-16 md:px-16 md:py-20 text-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-4"
                >
                  Share and Pay with Ease
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-lg text-white/90 mb-6 max-w-lg"
                >
                  Discover Tunisia's first destination for digital gift cards.
                  Choose from Steam, Plystation, Amazon, and more - all with instant
                  delivery and secure transactions.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <button
                    onClick={() => navigate("/categories")}
                    className="w-full px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h7"
                      />
                    </svg>
                    Browse All Categories
                  </button>
                </motion.div>
              </div>

              {/* Card Display */}
              <div className="hidden md:flex justify-center">
                <div className="relative w-64 h-64">
                  <motion.div
                    initial={{ opacity: 0, x: 20, rotate: -5 }}
                    animate={{ opacity: 1, x: 0, rotate: -5 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="absolute top-0 right-0 w-52 h-32 bg-white rounded-xl shadow-2xl overflow-hidden transform rotate-6"
                  >
                    <img
                      src="https://i.ibb.co/Kz7t4XWC/2025-04-25-13-45-49-amazon-com-usa-webp-720-432-Brave.png"
                      alt="Gift Card"
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20, rotate: 5 }}
                    animate={{ opacity: 1, x: 0, rotate: 5 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="absolute top-10 left-0 w-52 h-32 bg-white rounded-xl shadow-2xl overflow-hidden transform -rotate-3"
                  >
                    <img
                      src="https://i.ibb.co/gZshXJMt/2025-04-25-13-44-50-steam-usa-webp-720-432-Brave.png"
                      alt="Gift Card"
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-52 h-32 bg-white rounded-xl shadow-2xl overflow-hidden"
                  >
                    <img
                      src="https://cdn.mos.cms.futurecdn.net/uWzrrjPJhUwZhaHPjDYcmn-1200-80.jpg.webp"
                      alt="Gift Card"
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 