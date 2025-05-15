import React, { useEffect, useRef, useState } from "react";

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  closeOnClickOutside?: boolean;
}

const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  children,
  size = "md",
  className = "",
  closeOnClickOutside = true,
}) => {
  // State to track selection activity
  const [isSelecting, setIsSelecting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";

      // Global handlers for mouse events
      const handleGlobalMouseUp = () => {
        setIsSelecting(false);
      };

      const handleGlobalMouseDown = (e: MouseEvent) => {
        // Check if click was outside the modal and if we should close on outside click
        if (
          closeOnClickOutside &&
          modalRef.current &&
          !modalRef.current.contains(e.target as Node)
        ) {
          // Only close the modal if we're not in the middle of selecting text
          if (!isSelecting) {
            onClose();
          }
        }
      };

      // Handle escape key
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      // Add capture phase event listeners
      document.addEventListener("mouseup", handleGlobalMouseUp, true);
      document.addEventListener("mousedown", handleGlobalMouseDown, true);
      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.body.style.overflow = "unset";
        document.removeEventListener("mouseup", handleGlobalMouseUp, true);
        document.removeEventListener("mousedown", handleGlobalMouseDown, true);
        document.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen, onClose, isSelecting, closeOnClickOutside]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-xl",
    xl: "max-w-2xl",
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in"
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} overflow-hidden animate-in zoom-in-95 duration-200 ${className}`}
        onMouseDown={() => setIsSelecting(true)}
      >
        {children}
      </div>

      <style className="custom-scrollbar-style">
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #c1c5cb;
          }
        `}
      </style>
    </div>
  );
};

export default BaseModal;
