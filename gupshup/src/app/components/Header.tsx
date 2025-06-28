"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./Button";
import useAuth from "../hooks/useAuth";
import Image from "next/image";
import { authService } from "../services/api";

export function Header() {
  var router = useRouter();
  let { user } = useAuth();

  const handelLogout = () => {
    authService.logout();
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center w-screen item">
      <div className="bg-[#FDC62E] min-w-full h-6"></div>
      <div className="flex items-center justify-between w-full h-full mt-5 px-10">
        <Link href="/">
          <img src="/fullLogo.svg" alt="logo" className="w-fit h-fit"/>
        </Link>
        <div className="flex items-center gap-10">
          {user ? (
            <div className="w-10 h-10 rounded-full overflow-hidden" onClick={handelLogout}>
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600">
                  {user.userName?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
            </div>
          ) : (
            <Link
              className="text-[#5A5A5A] underline-[#5A5A5A] underline underline-offset-3 text-2xl hover:cursor-pointer"
              href="login"
            >
              Log In
            </Link>
          )}
          <Button
            buttonText="Start Talking ➜"
            onClick={() => router.push("/chat")}
          />
        </div>
      </div>
    </div>
  );
}
