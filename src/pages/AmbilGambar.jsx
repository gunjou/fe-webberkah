import { React, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import CameraComponent from "./components/CameraComponent";

const AmbilGambar = () => {
  const [image, setImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false); // State untuk mengontrol tampilan kamera
  const navigate = useNavigate(); // Initialize useNavigate

  const handleCapture = (imageSrc) => {
    setImage(imageSrc); // Simpan gambar yang diambil ke state
    setShowCamera(false); // Sembunyikan kamera setelah mengambil gambar
  };

  const handleCloseCamera = () => {
    setShowCamera(false); // Sembunyikan kamera
  };

  const handleSave = () => {
    const currentStatus = localStorage.getItem("statusAbsen");

    if (currentStatus === "masuk") {
      localStorage.setItem("statusAbsen", "pulang"); // Ubah status ke "pulang"
      alert("Absen Masuk Berhasil!");
    } else {
      localStorage.setItem("statusAbsen", "masuk"); // Ubah status ke "masuk"
      alert("Absen Pulang Berhasil!");
    }

    setImage(null); // Reset gambar setelah disimpan
    navigate("/absensi"); // Kembali ke halaman Absensi
  };

  // Open the camera automatically when the component is mounted
  useEffect(() => {
    setShowCamera(true);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-custom-merah to-custom-gelap pb-[900px]">
      <div className="mt-5 pb-5 text-center text-white">
        Tekan ambil foto untuk melakukan absensi
        <div className="flex bg-white rounded-[12px] shadow-lg p-6 flex flex-col items-center max-w-sm w-full ">
          {showCamera ? (
            <CameraComponent
              onCapture={handleCapture}
              onClose={handleCloseCamera}
            />
          ) : (
            <>
              {image ? (
                <button
                  onClick={handleSave}
                  className="flex w-[100px] text-white items-center justify-center bg-custom-merah hover:bg-green-700 text-black font-medium rounded-[20px] px-2 py-2 mt-2 shadow-md"
                >
                  Simpan
                </button>
              ) : (
                <button
                  onClick={() => setShowCamera(true)}
                  className="flex w-[100px] text-white items-center justify-center bg-custom-merah hover:bg-custom-gelap text-black font-medium rounded-[20px] px-2 py-2 mt-2 shadow-md"
                >
                  Ambil Foto
                </button>
              )}
            </>
          )}
          {image && (
            <div className="mt-4">
              <img
                src={image}
                alt="Captured"
                style={{ transform: "scaleX(-1)" }}
                className="rounded-lg shadow-md"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AmbilGambar;
