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

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  return `${backendUrl}${avatarPath}`;
};
