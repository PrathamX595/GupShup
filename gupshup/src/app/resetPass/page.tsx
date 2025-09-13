"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { authService } from "../services/api";
import useAuth from "../hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import ForgotPasswordModal from "../components/modals/ForgetPassword";

function ResetPasswordContent() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const id = searchParams.get("id");
  const token = searchParams.get("token");

  const [forgotPasswordModal, setForgotPasswordModal] = useState(false);

  useEffect(() => {
    if (user) {
      authService.logout();
    }
    
    if (!id || !token) {
      setError("Invalid reset link. Please request a new password reset link.");
    }
  }, [user, router, id, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!id || !token) {
      setError("Invalid reset link. Please request a new password reset link.");
      return;
    }

    setIsLoading(true);
    
    try {
      await authService.resetPassword(newPassword, id, token);
      setSuccess(true);
      
      setTimeout(() => {
        router.push("/login");
      }, 3000);
      
    } catch (error: any) {
      let errorMessage = "Failed to reset password. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid or expired reset link. Please request a new one.";
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
    try {
      const response = await authService.resetPasswordLink(email);
      return response;
    } catch (error) {
      throw error;
    }
  };

  if (success) {
    return (
      <div className="text-black flex flex-col items-center justify-center min-h-screen bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_2px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_2px)] bg-[size:6rem_6rem] font-[family-name:var(--font-kiwi-regular)] px-4">
        <div className="flex flex-col items-center w-full fixed top-0 left-0 z-50">
          <div className="bg-[#FDC62E] w-full h-6"></div>
        </div>
        <div className="bg-white px-6 sm:px-8 md:px-12 py-6 sm:py-8 rounded-2xl shadow-md w-full max-w-sm sm:max-w-md md:max-w-lg border-4 border-black relative my-8 sm:my-12 mt-14 sm:mt-16">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl font-[family-name:var(--font-kiwi-medium)] mb-3 sm:mb-4 text-green-800">
              Password Reset Successful!
            </h1>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
              Your password has been successfully updated. You will be redirected to the login page shortly.
            </p>
            <Link 
              href="/login"
              className="bg-[#FDC62E] hover:bg-[#f5bb1f] text-black px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="text-black flex flex-col items-center justify-center min-h-screen bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_2px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_2px)] bg-[size:6rem_6rem] font-[family-name:var(--font-kiwi-regular)] px-4">
        <div className="flex flex-col items-center w-full fixed top-0 left-0 z-50">
          <div className="bg-[#FDC62E] w-full h-6"></div>
        </div>
        <div className="bg-white px-6 sm:px-8 md:px-12 py-6 rounded-2xl shadow-md w-full max-w-sm sm:max-w-md md:max-w-lg border-4 border-black relative my-8 sm:my-12 mt-14 sm:mt-16">
          <div className="flex flex-col items-center mb-4 sm:mb-6">
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <img
                src="/gupshupBoxed.svg"
                alt="GupShup Logo"
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
              />
            </div>
            <h1 className="text-black text-xl sm:text-2xl font-[family-name:var(--font-kiwi-medium)] text-center">
              Reset Your Password
            </h1>
            <p className="text-black mt-1 text-center text-sm sm:text-base">
              Enter your new password below
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <p className="text-red-700 text-xs sm:text-sm font-medium flex items-center gap-2">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
              {error.includes("Invalid or expired") && (
                <button
                  onClick={() => setForgotPasswordModal(true)}
                  className="mt-2 text-[#FDC62E] hover:text-[#f5bb1f] text-xs sm:text-sm underline"
                >
                  Request new reset link
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-[family-name:var(--font-kiwi-medium)] mb-1 sm:mb-2">
                New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                className="w-full px-4 sm:px-5 py-2 sm:py-3 bg-[#D9D9D9] placeholder:text-[#A7A7A7] placeholder:text-xs sm:placeholder:text-sm rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-[#FDC62E] text-sm sm:text-base"
                required
                minLength={6}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 6 characters long
              </p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-[family-name:var(--font-kiwi-medium)] mb-1 sm:mb-2">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className="w-full px-4 sm:px-5 py-2 sm:py-3 bg-[#D9D9D9] placeholder:text-[#A7A7A7] placeholder:text-xs sm:placeholder:text-sm rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-[#FDC62E] text-sm sm:text-base"
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col items-center w-full mt-6 sm:mt-8">
              <button
                type="submit"
                disabled={isLoading || !newPassword || !confirmPassword}
                className={`w-full px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base ${
                  isLoading || !newPassword || !confirmPassword
                    ? "bg-gray-400 cursor-not-allowed text-gray-600"
                    : "bg-[#FDC62E] hover:bg-[#f5bb1f] text-black"
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-black"></div>
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>

            <div className="text-center mt-4 sm:mt-6">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
                <Link
                  href="/login"
                  className="text-[#FDC62E] hover:text-[#FCBC0D] underline font-[family-name:var(--font-kiwi-medium)]"
                >
                  Back to Login
                </Link>
                <span className="text-gray-400 hidden sm:inline">|</span>
                <button
                  type="button"
                  onClick={() => setForgotPasswordModal(true)}
                  className="text-[#FDC62E] hover:text-[#FCBC0D] underline font-[family-name:var(--font-kiwi-medium)]"
                >
                  Need new link?
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      <ForgotPasswordModal
        isOpen={forgotPasswordModal}
        onClose={() => setForgotPasswordModal(false)}
        onSubmit={handleForgotPassword}
      />
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="text-black flex flex-col items-center justify-center min-h-screen bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_2px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_2px)] bg-[size:6rem_6rem] font-[family-name:var(--font-kiwi-regular)] px-4">
        <div className="flex flex-col items-center w-full fixed top-0 left-0 z-50">
          <div className="bg-[#FDC62E] w-full h-6"></div>
        </div>
        <div className="bg-white px-6 sm:px-8 md:px-12 py-6 rounded-2xl shadow-md w-full max-w-sm sm:max-w-md md:max-w-lg border-4 border-black relative my-8 sm:my-12 mt-14 sm:mt-16">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FDC62E]"></div>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}