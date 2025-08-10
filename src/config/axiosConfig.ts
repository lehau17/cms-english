// utils/axiosConfig.js
import axios from "axios";

// Lấy baseURL từ env
const baseURL = import.meta.env.VITE_API_URL

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
        const token = localStorage.getItem("access-token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // console.log("Request config:", config);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor cho response
axiosInstance.interceptors.response.use(
    (response) => {
        // console.log("Response data:", response);
        return response; // Trả luôn response.data
    },
    (error) => {
        if (error.response) {
            // Server trả về lỗi
            console.error("API Error:", error.response);
            if (error.response.status === 401) {
                // Ví dụ: token hết hạn → redirect login
                console.warn("Unauthorized, redirecting to login...");
                localStorage.removeItem("access-token");
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
