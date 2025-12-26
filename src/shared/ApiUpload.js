import axios from "axios";

const apiUpload = axios.create({
  baseURL: "https://api.berkahangsana.com",
  timeout: 30000,
});

// Interceptor request
apiUpload.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    /**
     * PENTING:
     * JANGAN set Content-Type di sini
     * Biarkan axios menentukan boundary multipart
     */

    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: interceptor response (debug)
apiUpload.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("UPLOAD ERROR:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiUpload;
