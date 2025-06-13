import React, { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import checkAppVersion from "./shared/utils/check_version";
import Dashboard from "./admin/pages/Dashboard";
import NotFound from "./shared/NotFound";
import LoginAdmin from "./admin/pages/LoginAdmin";
import ProtectedRoute from "./admin/components/ProtectedRoute";
import "./index.css";

function App() {
  const token = localStorage.getItem("token");

  // Validasi token kadaluarsa saat load pertama
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;

        if (decoded.exp < now) {
          console.log("Token expired, force logout");
          localStorage.clear();
          window.location.replace("/login");
        }
      } catch (err) {
        console.log("Invalid token, force logout");
        localStorage.clear();
        window.location.replace("/login");
      }
    }
    checkAppVersion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Login route tidak perlu proteksi */}
        <Route path="/login" element={<LoginAdmin />} />

        {/* Redirect dari / ke /dashboard jika sudah login */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" />
            </ProtectedRoute>
          }
        />

        {/* Semua halaman lain diproteksi */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pegawai"
          element={
            <ProtectedRoute>
              <Dashboard type="profile-pegawai" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/presensi"
          element={
            <ProtectedRoute>
              <Dashboard type="presensi" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rekapan"
          element={
            <ProtectedRoute>
              <Dashboard type="rekapan" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lembur"
          element={
            <ProtectedRoute>
              <Dashboard type="lembur" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/perhitungan-gaji"
          element={
            <ProtectedRoute>
              <Dashboard type="perhitungan-gaji" />
            </ProtectedRoute>
          }
        />

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
