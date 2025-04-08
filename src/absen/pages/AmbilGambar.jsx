import { React, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Import useNavigate
import CameraComponent from "../components/CameraComponent";
import api from "../../shared/Api";

const AmbilGambar = () => {
  const [image, setImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false); // State untuk mengontrol tampilan kamera
  const navigate = useNavigate(); // Initialize useNavigate
  const location = useLocation();
  const mode = location.state?.mode || "checkin"; // default ke checkin
  const [isLoading, setIsLoading] = useState(false);

  const handleCapture = (imageSrc) => {
    setImage(imageSrc); // Simpan gambar yang diambil ke state
    setShowCamera(false); // Sembunyikan kamera setelah mengambil gambar
  };

  const handleCloseCamera = () => {
    setShowCamera(false); // Sembunyikan kamera
  };

  const resizeImage = (base64Str, maxWidth = 640, maxHeight = 640) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;

      img.onload = () => {
        let canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Hitung rasio
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const resizedBase64 = canvas.toDataURL("image/jpeg", 0.7); // kualitas 70%
        resolve(resizedBase64);
      };
    });
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    const id_karyawan = localStorage.getItem("id_karyawan");

    if (!image || !id_karyawan) {
      alert("Data tidak lengkap.");
      return;
    }

    setIsLoading(true); // ✅ MULAI loading

    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            const resizedImage = await resizeImage(image);
            const blob = await (await fetch(resizedImage)).blob();

            const formData = new FormData();
            formData.append("file", blob, "photo.jpg");
            formData.append("latitude", latitude);
            formData.append("longitude", longitude);

            const endpoint = `/absensi/${id_karyawan}`;
            const method = mode === "checkin" ? "post" : "put";

            const response = await api[method](endpoint, formData, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            });

            alert(response.data.status || "Check in berhasil!");
            navigate("/absensi");
          } catch (error) {
            console.error("Gagal kirim data absen:", error);

            const errorMessage =
              error.response?.data?.message ||
              error.response?.data?.status ||
              error.response?.data?.error ||
              "Gagal check in, silakan coba lagi.";

            alert("Gagal absen: " + errorMessage);
            setShowCamera(true);
          } finally {
            setIsLoading(false); // ✅ SELESAI loading
          }
        },
        (error) => {
          console.error("Gagal mendapatkan lokasi:", error);
          alert("Gagal mendapatkan lokasi, pastikan izin lokasi diaktifkan.");
          setIsLoading(false); // ✅ SELESAI loading jika gagal dapat lokasi
        }
      );
    } catch (error) {
      console.error("Kesalahan tak terduga:", error);
      alert("Terjadi kesalahan, silakan coba lagi.");
      setIsLoading(false); // ✅ SELESAI loading pada error
    }
  };

  useEffect(() => {
    const cekStatusAbsen = async () => {
      try {
        const id_karyawan = localStorage.getItem("id_karyawan");
        const token = localStorage.getItem("token");

        const response = await api.get(`/cek_presensi/${id_karyawan}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { jam_masuk, jam_keluar } = response.data;

        if (jam_masuk && jam_keluar) {
          alert("Anda sudah menyelesaikan absensi hari ini.");
          navigate("/absensi"); // arahkan ke halaman lain jika absensi selesai
        }
      } catch (error) {
        console.error("Gagal memeriksa status absensi", error);
        // Optional: arahkan user ke halaman error atau tampilkan pesan
      }
    };

    cekStatusAbsen();
  }, [navigate]);

  // Open the camera automatically when the component is mounted
  useEffect(() => {
    setShowCamera(true);
  }, []);

  return (
    <div className="bg-gradient-to-b from-custom-merah to-custom-gelap min-h-[100dvh]">
      <div className="flex items-start justify-center">
        <div className="mt-7 mx-4">
          <div className="pb-6 text-center text-white text-lg">
            Tekan ambil foto <br /> untuk melakukan absensi
          </div>
          <div className="flex bg-white rounded-[12px] shadow-lg pt-5 p-6 flex-col items-center max-w-sm w-full">
            {showCamera ? (
              <CameraComponent
                onCapture={handleCapture}
                onClose={handleCloseCamera}
              />
            ) : (
              <>
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

                {/* Loading Spinner */}
                {isLoading && (
                  <div className="flex flex-col items-center mt-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
                    <p className="text-sm text-gray-600 mt-2">
                      Memproses absensi...
                    </p>
                  </div>
                )}

                {/* Tombol Ambil Foto / Simpan */}
                <button
                  onClick={() => {
                    if (image) {
                      handleSave();
                    } else {
                      setShowCamera(true);
                    }
                  }}
                  disabled={isLoading}
                  className={`flex w-[100px] items-center justify-center ${
                    image
                      ? "bg-green-700"
                      : "bg-custom-merah hover:bg-custom-gelap"
                  } text-white font-medium rounded-[20px] px-2 py-2 mt-4 shadow-md ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "Menyimpan..." : image ? "Simpan" : "Ambil Foto"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmbilGambar;
