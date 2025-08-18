"use client";
import useAuth from "@/app/hooks/useAuth";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/app/services/api";
import { getAvatarUrl } from "@/app/services/avatar";
import DeleteAccountModal from "@/app/components/modals/DeleteAccountModal";
import ForgotPasswordModal from "@/app/components/modals/ForgetPassword";

function AccountPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [hasUsernameChanged, setHasUsernameChanged] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Modal states
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);
  const [forgotPasswordModal, setForgotPasswordModal] = useState(false);

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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }

    if (newPassword.length < 6) {
      alert("New password must be at least 6 characters long.");
      return;
    }

    if (currentPassword === newPassword) {
      alert("New password must be different from current password.");
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await authService.changePassword(
        currentPassword,
        newPassword
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      alert("Password changed successfully!");
    } catch (error: any) {
      let errorMessage = "Failed to change password. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setCurrentPassword("");

      alert(`Password change failed: ${errorMessage}`);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleUsernameChange = async () => {
    if (!user || !username.trim()) {
      alert("Please enter a valid username.");
      return;
    }

    if (username === user.userName) {
      setHasUsernameChanged(false);
      return;
    }

    setIsUpdatingUsername(true);

    try {
      const response = await authService.updateDetails(username, user.email);
      setHasUsernameChanged(false);
      alert("Username updated successfully!");
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      let errorMessage = "Failed to update username. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(`Username update failed: ${errorMessage}`);
      setUsername(user.userName || "");
      setHasUsernameChanged(false);
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  const handleDeleteAccount = () => {
    setDeleteAccountModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!user) return;

    setIsDeleting(true);

    try {
      const response = await authService.deleteAccount();
      alert(
        "Your account has been successfully deleted. You will be redirected to the home page."
      );

      localStorage.clear();
      sessionStorage.clear();

      router.push("/");
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error: any) {
      let errorMessage = "Failed to delete account. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(`Account deletion failed: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const response = await authService.updateAvatar(file);
      alert("Profile picture updated successfully!");

      window.location.reload();
    } catch (error: any) {
      let errorMessage = "Failed to update profile picture. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(`Avatar upload failed: ${errorMessage}`);
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handleForgotPassword = async (email: string) => {
    // TODO: Implement forgot password logic here
    alert(`Password reset instructions have been sent to ${email}`);
  };

  return (
    <>
      <div className="flex justify-center p-8 min-h-full">
        <div className="w-full max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              {user ? (
                <div className="w-20 h-20 rounded-full overflow-hidden relative group">
                  {user.avatar ? (
                    <Image
                      src={getAvatarUrl(user.avatar) || "/gupshupLogo.svg"}
                      alt="Profile"
                      width={80}
                      height={80}
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
                    <label
                      htmlFor="avatar-upload"
                      className={`${
                        isUploadingAvatar
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-[#FDC62E] cursor-pointer hover:text-[#f5bb1f]"
                      } transition-colors block`}
                    >
                      {isUploadingAvatar ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                          Uploading...
                        </span>
                      ) : (
                        "Upload new"
                      )}
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={isUploadingAvatar}
                      className="hidden"
                    />
                  </>
                )}
                <div className="text-sm text-gray-600">
                  Recommended size: 400x400px (Max 5MB)
                </div>
              </div>
            </div>

            {user && (
              <div className="bg-[#FDC62E] text-black px-4 py-2 rounded-lg font-semibold">
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
                      disabled={isUpdatingUsername}
                      className="w-full px-4 py-3 bg-gray-100 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#FDC62E] disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Enter username"
                      minLength={3}
                      maxLength={30}
                    />
                    {hasUsernameChanged && (
                      <button
                        onClick={handleUsernameChange}
                        disabled={isUpdatingUsername}
                        className={`${
                          isUpdatingUsername
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-[#FDC62E] hover:bg-[#f5bb1f]"
                        } text-black px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center gap-2`}
                      >
                        {isUpdatingUsername ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-black"></div>
                            Updating...
                          </>
                        ) : (
                          "Apply Changes"
                        )}
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
                  <span className="px-4 text-gray-600 text-sm font-medium">
                    change password
                  </span>
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
                          onClick={() => setForgotPasswordModal(true)}
                          className="text-[#FDC62E] text-sm hover:text-[#f5bb1f] hover:cursor-pointer transition-colors underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        disabled={isChangingPassword}
                        className="w-full px-4 py-3 bg-gray-100 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#FDC62E] disabled:opacity-50"
                        placeholder="Enter current password"
                        required
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
                          disabled={isChangingPassword}
                          className="w-full px-4 py-3 bg-gray-100 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#FDC62E] disabled:opacity-50"
                          placeholder="Enter new password"
                          minLength={6}
                          required
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
                          disabled={isChangingPassword}
                          className="w-full px-4 py-3 bg-gray-100 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#FDC62E] disabled:opacity-50"
                          placeholder="Confirm new password"
                          minLength={6}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className={`${
                      isChangingPassword
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#FDC62E] hover:bg-[#f5bb1f]"
                    } text-black px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2`}
                  >
                    {isChangingPassword ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                        Changing Password...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </button>
                </form>
              </div>

              <div>
                <div className="flex items-center mb-6">
                  <hr className="flex-1 border-red-300" />
                  <span className="px-4 text-red-500 text-sm font-medium">
                    Danger Zone
                  </span>
                  <hr className="flex-1 border-red-300" />
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-red-800 font-semibold mb-2">
                    Delete Account
                  </h3>
                  <p className="text-red-700 text-sm mb-4">
                    This action will permanently delete your account, including
                    all your data, upvotes, and chat history. This cannot be
                    undone.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className={`${
                      isDeleting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    } text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2`}
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Deleting Account...
                      </>
                    ) : (
                      "Delete Account"
                    )}
                  </button>
                </div>
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
                <h2 className="text-2xl font-semibold mb-2">
                  Account Settings
                </h2>
                <p className="text-gray-600">
                  Please log in to manage your account settings
                </p>
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

      <DeleteAccountModal
        isOpen={deleteAccountModal}
        onClose={() => setDeleteAccountModal(false)}
        onConfirm={handleDeleteConfirm}
        userName={user?.userName || ""}
        upvotes={user?.upvotes || 0}
      />

      <ForgotPasswordModal
        isOpen={forgotPasswordModal}
        onClose={() => setForgotPasswordModal(false)}
        onSubmit={handleForgotPassword}
      />
    </>
  );
}

export default AccountPage;
