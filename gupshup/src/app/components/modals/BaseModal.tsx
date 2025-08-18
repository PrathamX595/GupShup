"use client";

import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = "max-w-md" 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center font-[family-name:var(--font-kiwi-regular)]">
      <div 
        className="absolute inset-0"
        onClick={onClose}
      />
      
      <div className={`relative bg-white border-3 border-black rounded-lg shadow-lg ${maxWidth} w-full mx-4 p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg text-black">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            x
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;