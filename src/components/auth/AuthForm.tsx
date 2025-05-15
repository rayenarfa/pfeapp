import React from "react";
import { motion } from "framer-motion";

interface AuthFormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({
  children,
  onSubmit,
  className = "",
}) => {
  const formVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const fieldVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  // Add the fieldVariants to each child element
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return (
        <motion.div variants={fieldVariants}>
          {React.cloneElement(child)}
        </motion.div>
      );
    }
    return child;
  });

  return (
    <motion.form
      initial="hidden"
      animate="visible"
      variants={formVariants}
      onSubmit={onSubmit}
      className={`w-full ${className}`}
      noValidate
    >
      {childrenWithProps}
    </motion.form>
  );
};

export default AuthForm;
