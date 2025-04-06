import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Absensi from "./absen/pages/Absensi";
import AmbilGambar from "./absen/pages/AmbilGambar";
import InDevelopMobile from "./absen/pages/InDevelopMobile";
import NotFound from "./shared/NotFound";
import LoginKaryawan from "./absen/pages/LoginKaryawan";
import PrivateRoute from "./absen/components/PrivateRoute";

function App() {
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
          <Route path="/m-develop" element={<InDevelopMobile />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
