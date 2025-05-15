import React from "react";
import BaseModal from "./BaseModal";
import { ModalHeader, ModalBody, ModalFooter } from "./ModalComponents";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  icon?: React.ReactNode;
  variant?: "danger" | "warning" | "info";
  size?: "sm" | "md" | "lg" | "xl";
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  icon,
  variant = "warning",
  size = "sm",
}) => {
  // If icon is not provided, create a default one based on variant
  const defaultIcon = !icon ? (
    <div
      className={`${
        variant === "danger"
          ? "bg-red-100 text-red-600"
          : variant === "warning"
          ? "bg-amber-100 text-amber-600"
          : "bg-indigo-100 text-indigo-600"
      } p-2 rounded-full`}
    >
      {variant === "danger" || variant === "warning" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )}
    </div>
  ) : (
    icon
  );

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} size={size}>
      <ModalHeader title={title} onClose={onClose} icon={defaultIcon} />

      <ModalBody>
        <p className="text-sm text-gray-500">{description}</p>
      </ModalBody>

      <ModalFooter
        onCancel={onClose}
        onConfirm={handleConfirm}
        cancelLabel={cancelText}
        confirmLabel={confirmText}
        confirmVariant={
          variant === "danger"
            ? "danger"
            : variant === "warning"
            ? "warning"
            : "primary"
        }
      />
    </BaseModal>
  );
};

export default ConfirmDialog;
