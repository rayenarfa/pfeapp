import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Page404: React.FC = () => {
  const navigate = useNavigate();

  // Track page for analytics (optional)
  useEffect(() => {
    // If you have analytics, you can track 404 pages here
    // Example: analytics.track('404_page_viewed', { path: window.location.pathname });
    
    // Log for debugging purposes
    console.log(`404 error occurred at path: ${window.location.pathname}`);
  }, []);

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const pulseVariants = {
    initial: { scale: 1 },
    animate: { 
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <div className="w-full max-w-md mx-auto text-center">
        {/* 404 Number with animation */}
        <motion.div
          className="relative"
          variants={pulseVariants}
        >
          <motion.h1 
            className="text-9xl font-bold text-indigo-600 mb-6 opacity-90"
            variants={itemVariants}
          >
            404
          </motion.h1>
          
          {/* Decorative elements */}
          <motion.div 
            className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full opacity-20"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 5, 0, -5, 0],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div 
            className="absolute -bottom-2 -left-4 w-12 h-12 bg-indigo-300 rounded-full opacity-30"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, -5, 0, 5, 0],
              opacity: [0.3, 0.4, 0.3]
            }}
            transition={{ 
              duration: 3.5,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 0.5
            }}
          />
        </motion.div>

        {/* Content */}
        <motion.h2 
          className="text-2xl md:text-3xl font-bold text-gray-800 mb-4"
          variants={itemVariants}
        >
          Page Not Found
        </motion.h2>
        
        <motion.p 
          className="text-gray-600 mb-8 max-w-sm mx-auto"
          variants={itemVariants}
        >
          The page you're looking for doesn't exist or has been moved. We suggest you go back to the home page.
        </motion.p>
        
        {/* Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-3 justify-center"
          variants={itemVariants}
        >
          <motion.button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Go Back Home
          </motion.button>
          
          <motion.button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-white text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Go Back
          </motion.button>
        </motion.div>
        
        {/* Additional help link */}
        <motion.div 
          className="mt-8 text-sm text-gray-500"
          variants={itemVariants}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <p>
            Need help? <button onClick={() => navigate("/contact")} className="text-indigo-500 hover:text-indigo-700 underline">Contact support</button>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Page404;