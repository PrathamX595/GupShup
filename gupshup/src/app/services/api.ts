import axois from "axios";

const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";

const api = axois.create({
  baseURL: backendUrl,
  withCredentials: true,
  timeout: 1000,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

const authService = {
  googleLogin: () => {
    window.location.href = `${backendUrl}/api/auth/google`;
  },
  getProfilePic: () => {},
  verifyAuth: async() => {
    const res = await api.get(`${backendUrl}/api/auth/verify`);
    return res;
  },
};

export { authService };
