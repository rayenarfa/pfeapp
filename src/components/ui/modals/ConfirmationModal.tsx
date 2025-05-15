import React from "react";
import BaseModal from "./BaseModal";
import { ModalHeader, ModalBody, ModalFooter } from "./ModalComponents";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  size?: "sm" | "md" | "lg" | "xl";
}

const getVariantIcon = (variant: "danger" | "warning" | "info") => {
  const commonProps = {
    className:
      variant === "danger"
        ? "h-6 w-6 text-red-600"
        : variant === "warning"
        ? "h-6 w-6 text-amber-600"
        : "h-6 w-6 text-indigo-600",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
  };

  switch (variant) {
    case "danger":
    case "warning":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" {...commonProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      );
    case "info":
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" {...commonProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
  }
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  variant = "danger",
  size = "sm",
}) => {
  const icon = getVariantIcon(variant);
  const iconBgClass =
    variant === "danger"
      ? "bg-red-100"
      : variant === "warning"
      ? "bg-amber-100"
      : "bg-indigo-100";

  const headerIcon = (
    <div className={`${iconBgClass} rounded-full p-2`}>{icon}</div>
  );

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} size={size}>
      <ModalHeader title={title} onClose={onClose} icon={headerIcon} />

      <ModalBody>
        <p className="text-gray-600">{message}</p>
      </ModalBody>

      <ModalFooter
        onCancel={onClose}
        onConfirm={onConfirm}
        cancelLabel={cancelLabel}
        confirmLabel={confirmLabel}
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

export default ConfirmationModal;
