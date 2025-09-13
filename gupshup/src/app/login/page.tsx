"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { authService } from "../services/api";
import useAuth from "../hooks/useAuth";
import { useRouter } from "next/navigation";
import ForgotPasswordModal from "../components/modals/ForgetPassword";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  const [forgotPasswordModal, setForgotPasswordModal] = useState(false);

  useEffect(() => {
    if (user) {
      router.back();
      router.refresh();
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authService.login(email, password);
      router.push('/');
      router.refresh();
    } catch (error: any) {
      let errorMessage = "Login failed. Please check your credentials.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      alert(`Login failed: ${errorMessage}`);
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

  return (
    <>
      <div className="text-black flex flex-col items-center justify-center min-h-screen bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_2px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_2px)] bg-[size:6rem_6rem] font-[family-name:var(--font-kiwi-regular)] px-4">
        <div className="flex flex-col items-center w-full fixed top-0 left-0 z-50">
          <div className="bg-[#FDC62E] w-full h-6"></div>
        </div>
        <div className="bg-white px-6 sm:px-8 md:px-10 lg:px-12 py-6 rounded-2xl shadow-md w-full max-w-sm sm:max-w-md md:max-w-lg border-4 border-black relative my-8 sm:my-12 mt-14 sm:mt-16">
          <div className="flex flex-col items-center mb-4 sm:mb-6">
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <img
                src="/gupshupBoxed.svg"
                alt="GupShup Logo"
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
              />
            </div>
            <h1 className="text-black text-xl sm:text-2xl font-[family-name:var(--font-kiwi-medium)] text-center">
              Welcome back to GupShup
            </h1>
            <p className="text-black mt-1 text-sm sm:text-base text-center">
              Enter your Email and password to continue.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-[family-name:var(--font-kiwi-medium)] mb-1 sm:mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 sm:px-5 py-2 sm:py-3 bg-[#D9D9D9] placeholder:text-[#A7A7A7] placeholder:text-xs sm:placeholder:text-sm rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-[#FDC62E] text-sm sm:text-base"
                required
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-[family-name:var(--font-kiwi-medium)] mb-1 sm:mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 sm:px-5 py-2 sm:py-3 bg-[#D9D9D9] placeholder:text-[#A7A7A7] placeholder:text-xs sm:placeholder:text-sm rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-[#FDC62E] text-sm sm:text-base"
                required
              />
            </div>
            <div className="text-right">
              <button
                type="button"
                onClick={() => setForgotPasswordModal(true)}
                className="text-[#FDC62E] hover:text-[#FCBC0D] transition-colors underline hover:cursor-pointer text-sm sm:text-base"
              >
                Forgot password?
              </button>
            </div>
            <div className="flex flex-col items-center w-full pt-2">
              <div className="w-full">
                <Button buttonText="Sign In" className="w-full" />
              </div>
              <div className="text-center text-base sm:text-lg md:text-xl my-3 sm:my-4">or</div>
              <div className="w-full">
                <Button
                  type="button"
                  buttonText="Login with Google"
                  onClick={authService.googleLogin}
                  imgSrc="/googleLogo.svg"
                  className="bg-white hover:bg-amber-50 w-full"
                />
              </div>
            </div>
            <div className="text-center text-base sm:text-lg md:text-xl mt-4 sm:mt-6 font-[family-name:var(--font-kiwi-medium)]">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-[#FDC62E] hover:text-[#FCBC0D] underline"
              >
                Register
              </Link>
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