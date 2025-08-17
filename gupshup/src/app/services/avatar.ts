export const getAvatarUrl = (
  avatarPath: string | null | undefined
): string | null => {
  if (!avatarPath) return null;

  if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) {
    return avatarPath;
  }

  if (avatarPath.startsWith("data:image/")) {
    return avatarPath;
  }

  const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
  return `${backendUrl}${avatarPath}`;
};
