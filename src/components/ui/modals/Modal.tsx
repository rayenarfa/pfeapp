import React from "react";
import BaseModal from "./BaseModal";
import { ModalHeader, ModalBody, ModalFooter } from "./ModalComponents";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit: () => void;
  submitLabel: string;
  size?: "sm" | "md" | "lg" | "xl";
  closeOnClickOutside?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel,
  size = "md",
  closeOnClickOutside = true,
}) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      closeOnClickOutside={closeOnClickOutside}
    >
      <ModalHeader title={title} onClose={onClose} />

      <ModalBody>{children}</ModalBody>

      <ModalFooter
        onCancel={onClose}
        onConfirm={onSubmit}
        confirmLabel={submitLabel}
      />
    </BaseModal>
  );
};

export default Modal;
