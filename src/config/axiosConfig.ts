// utils/axiosConfig.js
import axios from "axios";

// Lấy baseURL từ env
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Tạo instance axios
const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "*/*",
  },
  timeout: 10000, // 10 giây
});

// Interceptor cho request
axiosInstance.interceptors.request.use(
  (config) => {
    const raw = localStorage.getItem("cms_auth");
    if (raw) {
      const { token } = JSON.parse(raw);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho response
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      console.error("API Error:", error.response);
      if (error.response.status === 401) {
        console.warn("Unauthorized, redirecting to login...");
        localStorage.removeItem("cms_auth");
        window.location.href = "/login";
      }
    } else {
      // Lỗi mạng hoặc timeout
      console.error("Network Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
