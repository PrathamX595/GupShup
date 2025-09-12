"use client";

import React, { useState } from "react";
import Modal from "./BaseModal";

interface ForgotPasswordModalProps {
  userEmail?: string | undefined;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  userEmail,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError) {
      setEmailError("");
    }
  };

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      setEmailError("Email is required");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (userEmail && trimmedEmail.toLowerCase() !== userEmail.toLowerCase()) {
      setEmailError("Please enter your registered email address");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(trimmedEmail);
      setEmail("");
      setEmailError("");
      onClose();
    } catch (error) {
      setEmailError("Failed to send reset link. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setEmailError("");
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const isButtonDisabled = !email.trim() || isSubmitting || !!emailError;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Forgot your Password ?">
      <div className="mb-6">
        <p className="text-black mb-4">
          that's cool with us, just enter your email
        </p>
        {userEmail && (
          <p className="text-gray-600 text-sm mb-3">
            Please enter your registered email address to receive the reset link
          </p>
        )}
        <div>
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            onKeyPress={handleKeyPress}
            placeholder={userEmail ? "Enter your registered email address" : "Enter your email address"}
            className={`w-full px-4 text-black py-3 bg-gray-100 rounded-lg border-none focus:outline-none focus:ring-2 ${
              emailError 
                ? "focus:ring-red-500 ring-2 ring-red-500" 
                : "focus:ring-[#FDC62E]"
            }`}
            autoFocus
          />
          {emailError && (
            <p className="text-red-500 text-sm mt-2 font-medium">
              {emailError}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-3 justify-start">
        <button
          onClick={handleSubmit}
          disabled={isButtonDisabled}
          className="px-4 py-2 bg-[#FDC62E] hover:bg-[#f5bb1f] text-black rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
              Sending...
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>
      </div>
    </Modal>
  );
};

export default ForgotPasswordModal;