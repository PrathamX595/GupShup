import { useState, useEffect } from "react";
import { authService } from "../services/api";

interface IUser extends Document {
  _id: string;
  userName: string;
  email: string;
  avatar: string;
  createdAt: Date;
  password: string;
  refreshToken: string;

  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const response = await authService.verifyAuth();

        if (isMounted) {
          setIsAuthenticated(true);
          setUser(response.data.user);
        }
      } catch (error: any) {
        // This is an expected error for unauthenticated users
        console.log("User not authenticated yet");

        if (isMounted) {
          setIsAuthenticated(false);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  return { isAuthenticated, user, isLoading };
};

export default useAuth;
