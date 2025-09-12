"use client";

import React, { useState } from "react";
import Modal from "./BaseModal";

interface ForgotPasswordModalProps {
  userEmail?: string | undefined;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<any>;
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
  const [successMessage, setSuccessMessage] = useState("");

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
    if (successMessage) {
      setSuccessMessage("");
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
    setEmailError("");
    setSuccessMessage("");

    try {
      const response = await onSubmit(trimmedEmail);
      
      if (response && response.status === 200) {
        setSuccessMessage("Password reset link has been sent to your email!");
        setEmail("");
        
        setTimeout(() => {
          setSuccessMessage("");
          onClose();
        }, 2000);
      }
    } catch (error: any) {
      console.error("Password reset error:", error);
      
      if (error.response?.status === 404) {
        setEmailError("Email not found in system");
      } else if (error.response?.data?.message) {
        setEmailError(error.response.data.message);
      } else {
        setEmailError("Failed to send reset link. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setEmailError("");
    setSuccessMessage("");
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !successMessage) {
      handleSubmit();
    }
  };

  const isButtonDisabled = !email.trim() || isSubmitting || !!emailError || !!successMessage;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Forgot your Password ?">
      <div className="mb-6">
        <p className="text-black mb-4">
          that's cool with us, just enter your email
        </p>
        {userEmail && !successMessage && (
          <p className="text-gray-600 text-sm mb-3">
            Please enter your registered email address to receive the reset link
          </p>
        )}
        
        {successMessage ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-700 font-medium flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {successMessage}
            </p>
          </div>
        ) : (
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
              disabled={isSubmitting}
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-2 font-medium">
                {emailError}
              </p>
            )}
          </div>
        )}
      </div>
      
      {!successMessage && (
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
      )}
    </Modal>
  );
};

export default ForgotPasswordModal;