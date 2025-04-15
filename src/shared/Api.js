// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor request: tambahkan token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor response: handle error 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const message = error.response?.data?.status;

      if (message === "Invalid username or password") {
        // Biarkan ditangani oleh komponen yang melakukan login (jangan handle di interceptor)
        return Promise.reject(error);
      }

      if (message === "Token expired, Login ulang") {
        alert("Sesi Anda telah berakhir. Silakan login ulang.");

        localStorage.removeItem("token");
        localStorage.removeItem("id_karyawan");
        localStorage.removeItem("id_admin");
        localStorage.removeItem("nama");
        localStorage.removeItem("role");
        localStorage.removeItem("jenis");
        localStorage.removeItem("avatarColor");

        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
