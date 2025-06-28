"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { authService } from "../services/api";
import { useRouter } from "next/navigation";
import useAuth from "../hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const router = useRouter();
  const {user} = useAuth();

  useEffect(()=>{
    if(user){
      router.back();
      router.refresh();
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await authService.register(username, email, password);
    router.back();
    router.refresh();
  };

  return (
    <div className="text-black flex flex-col items-center justify-center min-h-screen bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_2px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_2px)] bg-[size:6rem_6rem] font-[family-name:var(--font-kiwi-regular)]">
      <div className="flex flex-col items-center w-screen item">
        <div className="bg-[#FDC62E] min-w-full h-6"></div>
      </div>
      <div className="bg-white px-12 py-6 rounded-2xl shadow-md max-w-lg w-full border-4 border-black relative my-12">
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <img
              src="/gupshupBoxed.svg"
              alt="GupShup Logo"
              className="w-24 h-24"
            />
          </div>
          <h1 className="text-black text-2xl font-[family-name:var(--font-kiwi-medium)]">
            Welcome to GupShup
          </h1>
          <p className="text-black mt-1">Enter your details to continue.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-[family-name:var(--font-kiwi-medium)]">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-5 py-2 mt-2 bg-[#D9D9D9] placeholder:text-[#A7A7A7] placeholder:text-sm rounded-xl border-none focus:outline-none focus:ring-0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-[family-name:var(--font-kiwi-medium)]">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-5 py-2 mt-2 bg-[#D9D9D9] placeholder:text-[#A7A7A7] placeholder:text-sm rounded-xl border-none focus:outline-none focus:ring-0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-[family-name:var(--font-kiwi-medium)]">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-5 py-2 mt-2 bg-[#D9D9D9] placeholder:text-[#A7A7A7] placeholder:text-sm rounded-xl border-none focus:outline-none focus:ring-0"
              required
            />
          </div>
          <div className="flex flex-col items-center w-full mt-10">
            <Button buttonText="Register" type="submit" className="w-full" />
            <div className="text-center text-xl my-4">or</div>
            <Button
              type="button"
              buttonText="Login with Google"
              onClick={authService.googleLogin}
              imgSrc="/googleLogo.svg"
              className="bg-white hover:bg-amber-50 w-full"
            />
          </div>
          <div className="text-center text-xl mt-6 font-[family-name:var(--font-kiwi-medium)]">
            Already have an account?
            <Link
              href="/login"
              className="text-[#FDC62E] hover:text-[#FCBC0D] underline"
            >
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
