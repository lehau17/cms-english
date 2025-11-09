// utils/axiosConfig.js
import axios from "axios";
import toast from "react-hot-toast";

// Lấy baseURL từ env
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Tạo instance axios
const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "*/*",
  },
  timeout: 100000000, // 10 giây
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
      const status = error.response.status;
      const message =
        error.response.data?.message || error.response.statusText || "Request failed";
      console.error("API Error:", error.response);
      if (status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("cms_auth");
        window.location.href = "/login";
      } else if (status >= 500) {
        toast.error("Lỗi máy chủ. Vui lòng thử lại sau.");
      } else {
        toast.error(message);
      }
    } else {
      // Lỗi mạng hoặc timeout
      console.error("Network Error:", error.message);
      toast.error("Không thể kết nối máy chủ. Kiểm tra mạng của bạn.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
