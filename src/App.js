import "./App.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Shared
import LoginForm from "./shared/components/LoginForm";
import NotFound from "./shared/NotFound";

// Admin
import Dashboard from "./admin/pages/Dashboard";
import Pegawai from "./admin/pages/Pegawai";
import Presensi from "./admin/pages/Presensi";
import Rekapan from "./admin/pages/Rekapan";
import Lembur from "./admin/pages/Lembur";
import PerhitunganGaji from "./admin/pages/PerhitunganGaji";

// Absen
import Absensi from "./absen/pages/Absensi";
import AmbilGambar from "./absen/pages/AmbilGambar";
import InDevelopMobile from "./absen/pages/InDevelopMobile";
import History from "./absen/pages/History";

// Fungsi pengecekan role dari localStorage
const getRole = () => localStorage.getItem("jenis");

function App() {
  const role = getRole();

  useEffect(() => {
    const checkTokenValidity = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/protected`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Token invalid or expired");
        }
      } catch (error) {
        localStorage.clear();
        window.location.href = "/login";
      }
    };

    checkTokenValidity();
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Login shared */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginForm />} />

          {/* ADMIN ROUTES */}
          {role === "admin" && (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pegawai" element={<Pegawai />} />
              <Route path="/presensi" element={<Presensi />} />
              <Route path="/rekapan" element={<Rekapan />} />
              <Route path="/lembur" element={<Lembur />} />
              <Route path="/perhitungan-gaji" element={<PerhitunganGaji />} />
            </>
          )}

          {/* KARYAWAN ROUTES */}
          {role === "karyawan" && (
            <>
              <Route path="/absensi" element={<Absensi />} />
              <Route path="/ambil-gambar" element={<AmbilGambar />} />
              <Route path="/history" element={<History />} />
              <Route path="/m-develop" element={<InDevelopMobile />} />
            </>
          )}

          {/* 404 Fallback */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
