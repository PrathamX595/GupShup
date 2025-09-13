import axios from "axios";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

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
  updateDetails: async (userName: string, email: string) => {
    const response = await api.put("/api/auth/update", {
      userName,
      email,
    });
    return response;
  },
  deleteAccount: async () => {
    try {
      const res = await api.delete(`/api/auth/delete`);
      return res;
    } catch (error) {
      throw error;
    }
  },
  updateAvatar: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await api.put("/api/auth/update-avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
  changePassword: async (oldPassword: string, newPassword: string) => {
    try {
      const response = await api.put("/api/auth/update-pass", {
        oldPassword,
        newPassword,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
  resetPasswordLink: async(email: string) => {
    try {
      const response = await api.put("/api/auth/resetLink", {email})
      return response
    } catch (error) {
      throw error;
    }
  },
  resetPassword: async(newPass: string, id:string, token:string) => {
    try {
      const response = await api.put("/api/auth/resetPass", {newPass, id, token})
      return response
    } catch (error) {
      throw error;
    }
  }
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
      console.error(
        "removeUpvote error:",
        error.response?.data || error.message
      );
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
      console.error(
        "removeFromList error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  checkUpvoteStatus: async (email: string) => {
    try {
      const res = await api.get(
        `/api/upvote/status?email=${encodeURIComponent(email)}`
      );
      return res;
    } catch (error: any) {
      console.error(
        "checkUpvoteStatus error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};

export { authService, votingService };
