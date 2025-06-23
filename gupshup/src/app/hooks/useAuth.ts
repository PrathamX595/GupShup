import { useState, useEffect } from "react";
import { authService } from "../services/api";

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authService.verifyAuth();

        if (response.status === 200) {
          const data = await response.data;
          setIsAuthenticated(true);
          setUser(data.user);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
        throw error;
      } finally{
        setIsLoading(false);
      }
    };

    checkAuth()
  }, []);

  return {isAuthenticated, user, isLoading}
};

export default useAuth;
