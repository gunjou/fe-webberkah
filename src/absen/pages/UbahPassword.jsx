import React, { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { RiHomeLine } from "react-icons/ri";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const UbahPassword = () => {
  const navigate = useNavigate();
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!isFirstTime && !currentPassword) {
      setError("Kata sandi saat ini wajib diisi.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Kata sandi baru dan konfirmasi kata sandi tidak cocok.");
      return;
    }

    console.log("Kata sandi berhasil diubah.!");
    alert("Password berhasil diubah!");
    navigate("/absensi"); // Redirect to the absensi page after successful password change
  };

  return (
    <div className="bg-gradient-to-b text-white from-custom-merah to-custom-gelap min-h-[100dvh] flex items-center">
      <div className="absolute top-0 left-0 w-full px-4 pt-4 flex justify-start space-x-3">
        <button
          onClick={() => navigate(-1)}
          className="text-white text-2xl hover:text-gray-300"
        >
          <FiArrowLeft />
        </button>
        <button
          onClick={() => navigate("/absensi")}
          className="text-white text-2xl hover:text-gray-300"
        >
          <RiHomeLine />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white text-black p-4 rounded-lg shadow-lg w-full mx-4 my-4"
      >
        <h1 className="text-2xl font-bold mb-2 text-left">Ganti Password</h1>
        <p className="text-sm mb-4 text-gray-600 text-justify">
          Masukkan password baru untuk akun Anda. Jika ini adalah pertama kali
          anda mengubah password, silakan masukkan password baru tanpa
          memasukkan password lama.
        </p>
        {!isFirstTime && (
          <div className="mb-4 relative">
            <label className="block text-sm font-medium mb-1 text-left">
              Current Password
            </label>
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Enter current password"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-9 text-gray-500"
            >
              {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        )}
        <div className="mb-4 relative">
          <label className="block text-sm font-medium mb-1 text-left text-left">
            New Password
          </label>
          <input
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Enter new password"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-9 text-gray-500"
          >
            {showNewPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
        <div className="mb-4 relative">
          <label className="block text-sm font-medium mb-1 text-left ">
            Confirm Password
          </label>
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Confirm new password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-9 text-gray-500"
          >
            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          type="submit"
          className="w-1/2 bg-blue-500 text-white py-2 rounded-[20px] hover:bg-blue-600"
        >
          Simpan
        </button>
      </form>
    </div>
  );
};

export default UbahPassword;
