"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./Button";
import useAuth from "../hooks/useAuth";
import Image from "next/image";
import { authService } from "../services/api";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./DropDown";

export function Header() {
  var router = useRouter();
  let { user } = useAuth();

  const handleLogout = async () => {
    try {
      await authService.logout();
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const ProfileTrigger = () => (
    <div className="w-10 h-10 rounded-full overflow-hidden hover:ring-2 hover:ring-gray-300 transition-all">
      {user?.avatar ? (
        <Image
          src={user.avatar}
          alt="Profile"
          width={40}
          height={40}
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600">
          {user?.userName?.charAt(0)?.toUpperCase() || "U"}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center w-screen item">
      <div className="bg-[#FDC62E] min-w-full h-6"></div>
      <div className="flex items-center justify-between w-full h-full mt-5 px-10">
        <Link href="/">
          <img src="/fullLogo.svg" alt="logo" className="w-fit h-fit" />
        </Link>
        <div className="flex items-center gap-10">
          {user ? (
            <DropdownMenu trigger={<ProfileTrigger />} align="end">
              <div className="px-4 py-2 border-b border-gray-200">
                <div className="font-medium text-sm text-gray-900">
                  {user.userName || "User"}
                </div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
              <DropdownMenuItem
                onClick={() => router.push("/settings/account")}
                className="flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 hover:bg-red-50"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </DropdownMenuItem>
            </DropdownMenu>
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
