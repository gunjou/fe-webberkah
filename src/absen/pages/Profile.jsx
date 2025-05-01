import React, { useState, useRef } from "react";
import api from "../../shared/Api";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const toTitleCase = (str) => {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const Profile = () => {
  const navigate = useNavigate();
  const nama = toTitleCase(localStorage.getItem("nama"));
  const jenis = toTitleCase(localStorage.getItem("jenis"));
  const [image, setImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef();
  const [notification, setNotification] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      setNotification("Foto profil berhasil diubah");
      setTimeout(() => setNotification(""), 3000);
    }
  };

  const handleChangePhotoClick = () => {
    if (image) {
      setShowModal(true);
    } else {
      fileInputRef.current.click(); // langsung buka input file
    }
  };

  const handleRemovePhoto = () => {
    setImage(null);
    setShowModal(false);
    setNotification("Foto profil berhasil dihapus");
    setTimeout(() => setNotification(""), 3000);
  };

  return (
    <div className="bg-gradient-to-b text-white from-custom-merah to-custom-gelap min-h-[100dvh] flex flex-col items-center relative">
      <div className="w-full px-4 pt-4 absolute top-0 left-0 flex justify-start">
        <button
          onClick={() => navigate(-1)}
          className="text-white text-2xl hover:text-gray-300"
        >
          <FiArrowLeft />
        </button>
      </div>
      <h1 className="text-2xl font-bold mt-10">Edit Profile</h1>

      <div className="bg-gray-100 rounded-2xl p-6 flex items-center justify-between space-x-4 mt-6 w-4/5">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-gray-300 overflow-hidden">
            {image ? (
              <img
                src={image}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5.121 17.804A9 9 0 0112 15a9 9 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            )}
          </div>

          <div>
            <div className="font-semibold text-black text-lg">{nama}</div>
            <div className="text-gray-500 text-sm">{jenis}</div>
          </div>
        </div>

        <div>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-[20px] hover:bg-blue-600 cursor-pointer"
            onClick={handleChangePhotoClick}
          >
            Ubah photo
          </button>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
            className="hidden"
          />
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[90%] max-w-md text-center overflow-hidden">
            <div className="text-lg text-black font-semibold p-4 border-b">
              Ganti Photo Profil
            </div>
            <div
              className="text-blue-600 font-medium py-3 border-b cursor-pointer hover:bg-gray-50"
              onClick={() => fileInputRef.current.click()}
            >
              Upload Photo
            </div>
            <div
              className="text-red-500 font-medium py-3 border-b cursor-pointer hover:bg-gray-50"
              onClick={handleRemovePhoto}
            >
              Hapus Photo Profil
            </div>
            <div
              className="py-3 cursor-pointer text-black hover:bg-gray-100"
              onClick={() => setShowModal(false)}
            >
              Batal
            </div>
          </div>
        </div>
      )}
      {/* Notifikasi */}
      {notification && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-black px-4 py-2 rounded-lg shadow-lg">
          {notification}
        </div>
      )}
    </div>
  );
};

export default Profile;
