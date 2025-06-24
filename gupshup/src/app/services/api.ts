import axios from "axios";

const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
  timeout: 1000,
  headers: {
    "Content-Type": "application/json",
  },
});

const authService = {
  googleLogin: () => {
    window.location.href = `${backendUrl}/api/auth/google`;
  },
  getProfilePic: () => {},
  verifyAuth: async () => {
    try {
      const res = await api.get(`/api/auth/verify`);
      return res;
    } catch (error) {
      console.error("Auth verification error:", error);
      throw error;
    }
  },
  logout: async () => {
    const res = await api.get(`/api/auth/logout`);
    return res;
  },
  register: async (userName: string, email: string, password: string) => {
    try {
      const res = await api.post(`/api/auth/register`, {
        userName,
        email,
        password,
      });
      return res;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },
};

export { authService };
