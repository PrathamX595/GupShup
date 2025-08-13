"use client";
import useAuth from "@/app/hooks/useAuth";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

function AccountPage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [hasUsernameChanged, setHasUsernameChanged] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.userName || "");
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setHasUsernameChanged(username !== user.userName);
    }
  }, [username, user]);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Password change requested");
  };

  const handleUsernameChange = () => {
    console.log("Username change requested:", username);
    setHasUsernameChanged(false);
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      console.log("Account deletion requested");
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Avatar upload:", file);
    }
  };

  return (
    <div className="flex justify-center p-8 min-h-full">
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {user ? (
              <div className="w-20 h-20 rounded-full overflow-hidden relative">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt="Profile"
                    width={60}
                    height={60}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-2xl font-semibold">
                    {user.userName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full flex items-center justify-center">
                <Image
                  src="/gupshupLogo.svg"
                  alt="Default Avatar"
                  width={60}
                  height={60}
                />
              </div>
            )}
            
            <div>
              {user && (
                <>
                <label htmlFor="avatar-upload" className="text-[#FDC62E] cursor-pointer hover:text-[#f5bb1f] transition-colors">
                  Upload new
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                </>
              )}
              <div className="text-sm text-gray-600">Recommended size: 400x400px</div>
            </div>
          </div>
          
          {user && (
            <div className="bg-[#FDC62E] text-black px-4 py-2 rounded-lg">
              {user.upvotes || 0} Upvotes
            </div>
          )}
        </div>

        {user ? (
          <>
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#FDC62E]"
                  />
                  {hasUsernameChanged && (
                    <button
                      onClick={handleUsernameChange}
                      className="bg-[#FDC62E] text-black px-4 py-2 rounded-lg font-medium hover:bg-[#f5bb1f] transition-colors text-sm"
                    >
                      Apply Changes
                    </button>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-200 rounded-lg border-none cursor-not-allowed text-gray-600"
                />
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center mb-6">
                <hr className="flex-1 border-gray-300" />
                <span className="px-4 text-gray-600 text-sm font-medium">change password</span>
                <hr className="flex-1 border-gray-300" />
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Current password
                      </label>
                      <button
                        type="button"
                        className="text-[#FDC62E] text-sm hover:text-[#f5bb1f] transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-100 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#FDC62E]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-100 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#FDC62E]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-100 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#FDC62E]"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-[#FDC62E] text-black px-6 py-3 rounded-lg font-medium hover:bg-[#f5bb1f] transition-colors"
                >
                  Change password
                </button>
              </form>
            </div>

            <div>
              <div className="flex items-center mb-6">
                <hr className="flex-1 border-red-300" />
                <span className="px-4 text-red-500 text-sm font-medium">Danger Zone</span>
                <hr className="flex-1 border-red-300" />
              </div>

              <button
                onClick={handleDeleteAccount}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="mb-8">
              <Image
                src="/gupshupLogo.svg"
                alt="GupShup Logo"
                width={60}
                height={60}
                className="mx-auto mb-4"
              />
              <h2 className="text-2xl font-semibold mb-2">Account Settings</h2>
              <p className="text-gray-600">Please log in to manage your account settings</p>
            </div>
            
            <Link
              href="/login"
              className="inline-block bg-[#FDC62E] text-black px-8 py-3 rounded-lg font-medium hover:bg-[#f5bb1f] transition-colors"
            >
              Log In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default AccountPage;