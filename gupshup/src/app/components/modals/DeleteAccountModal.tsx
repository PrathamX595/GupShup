"use client";

import React, { useState } from "react";
import Modal from "./BaseModal";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
  upvotes: number;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName,
  upvotes,
}) => {
  const [step, setStep] = useState(1);
  const [inputValue, setInputValue] = useState("");

  const handleClose = () => {
    setStep(1);
    setInputValue("");
    onClose();
  };

  const handleFirstConfirm = () => {
    setStep(2);
  };

  const handleSecondConfirm = () => {
    setStep(3);
  };

  const handleFinalConfirm = () => {
    if (inputValue === userName) {
      onConfirm();
      handleClose();
    } else {
      alert("Username confirmation failed. Account deletion cancelled.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Wanna Delete your account ?"
    >
      {step === 1 && (
        <>
          <div className="mb-6">
            <p className="text-black mt-4">u sure ?</p>
          </div>
          <div className="flex gap-3 justify-start">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleFirstConfirm}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              yup
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="mb-6">
            <p className="text-gray-700 whitespace-pre-line">
              {`u weally sure ?

Deleting your account will:
• Remove all your data permanently
• Delete your ${upvotes} upvotes
• Remove your chat history
• This CANNOT be undone

Do you want to proceed?`}
            </p>
          </div>
          <div className="flex gap-3 justify-start">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSecondConfirm}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Yes, Delete My Account
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <div className="mb-4">
            <p className="text-gray-700 mb-4">
              To confirm deletion, please type your username: "{userName}"
            </p>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-3 bg-gray-100 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#FDC62E]"
              autoFocus
            />
          </div>
          <div className="flex gap-3 justify-start">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleFinalConfirm}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Please delete my account
            </button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default DeleteAccountModal;
