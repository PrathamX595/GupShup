"use client";

import React, { useState } from "react";
import Modal from "./BaseModal";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(email);
      setEmail("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Forgot your Password ?">
      <div className="mb-6">
        <p className="text-black mb-4">
          that's cool with us just enter your email
        </p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          className="w-full px-4 text-black py-3 bg-gray-100 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#FDC62E]"
          autoFocus
        />
      </div>
      <div className="flex gap-3 justify-start">
        <button
          onClick={handleSubmit}
          disabled={!email.trim() || isSubmitting}
          className="px-4 py-2 bg-[#FDC62E] hover:bg-[#f5bb1f] text-black rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
              Sending...
            </>
          ) : (
            "Submit"
          )}
        </button>
      </div>
    </Modal>
  );
};

export default ForgotPasswordModal;