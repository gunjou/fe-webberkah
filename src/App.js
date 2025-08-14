import "./App.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// Shared
import LoginForm from "./shared/components/LoginForm";
import NotFound from "./shared/NotFound";
import checkAppVersion from "./shared/utils/check_version";

// Admin
import Dashboard from "./admin/pages/Dashboard";
import Pegawai from "./admin/pages/Pegawai";
import Presensi from "./admin/pages/Presensi";
import Rekapan from "./admin/pages/Rekapan";
import Lembur from "./admin/pages/Lembur";
import PerhitunganGaji from "./admin/pages/PerhitunganGaji";
import Leaderboard from "./admin/pages/Leaderboard";
import HutangPegawai from "./admin/pages/HutangPegawai";

// Absen
import Absensi from "./absen/pages/Absensi";
import AmbilGambar from "./absen/pages/AmbilGambar";
import InDevelopMobile from "./absen/pages/InDevelopMobile";
import History from "./absen/pages/History";
import Settings from "./absen/pages/Settings";
import FormIzinSakit from "./absen/pages/FormIzinSakit";
import Profile from "./absen/pages/Profile";
import Tentang from "./absen/pages/Tentang";
import UbahPassword from "./absen/pages/UbahPassword";
import FormLembur from "./absen/pages/FormLembur";

function App() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("jenis");

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
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/perhitungan-gaji" element={<PerhitunganGaji />} />
              <Route path="/hutang-pegawai" element={<HutangPegawai />} />
            </>
          )}

          {/* KARYAWAN ROUTES */}
          {role === "karyawan" && (
            <>
              <Route path="/absensi" element={<Absensi />} />
              <Route path="/ambil-gambar" element={<AmbilGambar />} />
              <Route path="/history" element={<History />} />
              <Route path="/m-develop" element={<InDevelopMobile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/form-izin-sakit" element={<FormIzinSakit />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/tentang" element={<Tentang />} />
              <Route path="/ubah-password" element={<UbahPassword />} />
              <Route path="/form-lembur" element={<FormLembur />} />
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
