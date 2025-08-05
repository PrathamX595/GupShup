import axios from "axios";

const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const authService = {
  googleLogin: () => {
    window.location.href = `${backendUrl}/api/auth/google`;
  },
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
      throw error;
    }
  },
  login: async (email: string, password: string) => {
    try {
      const res = await api.post(`/api/auth/login`, {
        email,
        password,
      });
      return res;
    } catch (error) {
      throw error;
    }
  },
};

const votingService = {
  addVote: async (userName: string, email: string) => {
    try {
      console.log("addVote called with:", { userName, email });
      const res = await api.put(`/api/upvote/add`, {
        userName,
        email,
      });
      return res;
    } catch (error: any) {
      console.error("addVote error:", error.response?.data || error.message);
      throw error;
    }
  },
  updateList: async (userName: string, email: string) => {
    try {
      console.log("updateList called with:", { userName, email });
      const res = await api.put(`/api/upvote/addInList`, {
        userName,
        email,
      });
      return res;
    } catch (error: any) {
      console.error("updateList error:", error.response?.data || error.message);
      throw error;
    }
  },
  removeUpvote: async (userName: string, email: string) => {
    try {
      const res = await api.put(`/api/upvote/remove`, {
        userName,
        email,
      });
      return res;
    } catch (error: any) {
      console.error("removeUpvote error:", error.response?.data || error.message);
      throw error;
    }
  },
  removeFromList: async (email: string) => {
    try {
      const res = await api.put(`/api/upvote/removeFromList`, {
        email,
      });
      return res;
    } catch (error: any) {
      console.error("removeFromList error:", error.response?.data || error.message);
      throw error;
    }
  },
};

export { authService, votingService };
