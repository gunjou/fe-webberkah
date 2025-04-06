import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./admin/pages/Dashboard";
import NotFound from "./shared/NotFound";
import LoginAdmin from "./admin/pages/LoginAdmin";
import "./index.css";
import ProtectedRoute from "./admin/components/ProtectedRoute";

function App() {
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
