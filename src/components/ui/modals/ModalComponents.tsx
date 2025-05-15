import React from "react";
import { X } from "lucide-react";

// Modal Header Component
interface ModalHeaderProps {
  title: string;
  onClose?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  onClose,
  icon,
  className = "",
}) => {
  return (
    <div
      className={`flex items-center justify-between px-6 py-4 border-b ${className}`}
    >
      <div className="flex items-center gap-3">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

// Modal Body Component
interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalBody: React.FC<ModalBodyProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`px-6 py-5 max-h-[70vh] overflow-y-auto custom-scrollbar ${className}`}
    >
      {children}
    </div>
  );
};

// Modal Footer Component
interface ModalFooterProps {
  children?: React.ReactNode;
  className?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  confirmVariant?: "primary" | "danger" | "warning" | "success";
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  className = "",
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  onCancel,
  onConfirm,
  confirmVariant = "primary",
}) => {
  const variantClasses = {
    primary: "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500",
    danger: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    warning: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500",
    success: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
  };

  return (
    <div
      className={`px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3 ${className}`}
    >
      {children ? (
        children
      ) : (
        <>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
            >
              {cancelLabel}
            </button>
          )}
          {onConfirm && (
            <button
              type="button"
              onClick={onConfirm}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors ${variantClasses[confirmVariant]}`}
            >
              {confirmLabel}
            </button>
          )}
        </>
      )}
    </div>
  );
};
