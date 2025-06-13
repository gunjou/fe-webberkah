import "./App.css";
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import checkAppVersion from "./shared/utils/check_version";
import Absensi from "./absen/pages/Absensi";
import AmbilGambar from "./absen/pages/AmbilGambar";
import InDevelopMobile from "./absen/pages/InDevelopMobile";
import NotFound from "./shared/NotFound";
import LoginKaryawan from "./absen/pages/LoginKaryawan";
import PrivateRoute from "./absen/components/PrivateRoute";
import History from "./absen/pages/History";
import Settings from "./absen/pages/Settings";
import FormIzinSakit from "./absen/pages/FormIzinSakit";
import Profile from "./absen/pages/Profile";
import Tentang from "./absen/pages/Tentang";
import UbahPassword from "./absen/pages/UbahPassword";
import FormLembur from "./absen/pages/FormLembur";

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
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Absensi />
              </PrivateRoute>
            }
          />
          <Route
            path="/absensi"
            element={
              <PrivateRoute>
                <Absensi />
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<LoginKaryawan />} />
          <Route path="/ambil-gambar" element={<AmbilGambar />} />
          <Route path="/history" element={<History />} />
          <Route path="/m-develop" element={<InDevelopMobile />} />
          <Route path="/settings" element={<Settings />} />{" "}
          <Route path="/form-izin-sakit" element={<FormIzinSakit />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/tentang" element={<Tentang />} />
          <Route path="/ubah-password" element={<UbahPassword />} />
          <Route path="/form-lembur" element={<FormLembur />} />
          {/* 404 Fallback */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
