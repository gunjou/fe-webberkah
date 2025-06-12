import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../../shared/Api";
import { FiArrowLeft } from "react-icons/fi";

const Settings = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/logout/karyawan");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.clear();
      window.location.replace("/login"); // kembali ke halaman login
    }
  };

  return (
    <div className="bg-gradient-to-b text-white from-custom-merah to-custom-gelap min-h-[100dvh] flex flex-col items-center relative">
      <div className="w-full px-4 pt-4 absolute top-0 left-0 flex justify-start">
        <button
          title="Back"
          onClick={() => navigate(-1)}
          className="text-white text-2xl hover:text-gray-300"
        >
          <FiArrowLeft />
        </button>
      </div>
      <div className="text-lg font-bold mt-8">Settings</div>
      <div className="mt-6 w-4/5 bg-white rounded-lg shadow-lg text-black">
        <ul className="divide-y divide-gray-300">
          <li
            className="px-4 py-3 hover:bg-gray-100 cursor-pointer rounded-lg"
            onClick={() => navigate("/ubah-password")}
          >
            Ubah Password
          </li>
          <li
            className="px-4 py-3 hover:bg-gray-100 cursor-pointer rounded-lg"
            onClick={() => navigate("/tentang")}
          >
            Tentang
          </li>
          <li
            className="text-red-700 px-4 py-3 hover:bg-gray-100 cursor-pointer rounded-lg"
            onClick={() => {
              if (window.confirm("Apakah anda ingin keluar?")) {
                handleLogout();
              }
            }}
          >
            Logout
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Settings;
