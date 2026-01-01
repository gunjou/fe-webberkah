import { React, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CameraComponent from "../components/CameraComponent";
import api from "../../shared/Api";

const AmbilGambar = () => {
  const [image, setImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Mode sekarang bisa: "checkin", "selesai_istirahat", atau "checkout"
  const mode = location.state?.mode || "checkin";
  const [isLoading, setIsLoading] = useState(false);

  const handleCapture = (imageSrc) => {
    setImage(imageSrc);
    setShowCamera(false);
  };

  const handleCloseCamera = () => {
    setShowCamera(false);
  };

  const resizeImage = (base64Str, maxWidth = 640, maxHeight = 640) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        let canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
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
        resolve(canvas.toDataURL("image/jpeg", 0.7));
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

    setIsLoading(true);

    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const resizedImage = await resizeImage(image);
            const blob = await (await fetch(resizedImage)).blob();

            const formData = new FormData();
            formData.append("file", blob, "photo.jpg");
            formData.append("latitude", latitude);
            formData.append("longitude", longitude);

            // --- LOGIKA PENENTUAN ENDPOINT & METHOD ---
            let endpoint = "";
            let method = "post";

            if (mode === "checkin") {
              endpoint = `/absensi/check-in/${id_karyawan}`;
              method = "post";
            } else if (mode === "selesai_istirahat") {
              endpoint = `/absensi/istirahat/selesai`;
              method = "put"; // Sesuai instruksi PUT
            } else if (mode === "checkout") {
              endpoint = `/absensi/check-out/${id_karyawan}`;
              method = "put";
            }

            const response = await api[method](endpoint, formData, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            });

            alert(response.data.status || "Berhasil memproses absensi!");
            navigate("/absensi");
          } catch (error) {
            console.error("Gagal kirim data:", error);
            const msg =
              error.response?.data?.message || "Gagal, silakan coba lagi.";
            alert("Gagal: " + msg);
            setImage(null);
            setShowCamera(true);
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          alert("Gagal mendapatkan lokasi. Pastikan GPS aktif.");
          setIsLoading(false);
        }
      );
    } catch (error) {
      alert("Terjadi kesalahan teknis.");
      setIsLoading(false);
    }
  };

  // Pengecekan status agar user tidak masuk ke halaman ini jika sudah selesai semua
  useEffect(() => {
    const cekStatusAbsen = async () => {
      try {
        const id_karyawan = localStorage.getItem("id_karyawan");
        const token = localStorage.getItem("token");
        const response = await api.get(`/absensi/check/${id_karyawan}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { jam_masuk, jam_keluar } = response.data;
        // Hanya tendang keluar jika benar-benar sudah absen pulang
        if (jam_masuk && jam_keluar) {
          alert("Anda sudah menyelesaikan absensi hari ini.");
          navigate("/absensi");
        }
      } catch (error) {
        console.error("Gagal memeriksa status");
      }
    };
    cekStatusAbsen();
  }, [navigate]);

  useEffect(() => {
    setShowCamera(true);
  }, []);

  return (
    <div className="bg-gradient-to-b from-custom-merah to-custom-gelap min-h-[100dvh]">
      <div className="flex items-start justify-center">
        <div className="mt-7 mx-4 w-full max-w-sm">
          <div className="pb-6 text-center text-white text-lg font-medium">
            {mode === "checkin" && "Ambil Foto Masuk"}
            {mode === "selesai_istirahat" && "Ambil Foto Selesai Istirahat"}
            {mode === "checkout" && "Ambil Foto Pulang"}
          </div>
          <div className="flex bg-white rounded-[25px] shadow-2xl p-6 flex-col items-center">
            {showCamera ? (
              <CameraComponent
                onCapture={handleCapture}
                onClose={handleCloseCamera}
              />
            ) : (
              <>
                {image && (
                  <div className="mt-2 w-full">
                    <img
                      src={image}
                      alt="Captured"
                      style={{ transform: "scaleX(-1)" }}
                      className="rounded-[20px] shadow-md w-full border-4 border-gray-100"
                    />
                  </div>
                )}

                {isLoading && (
                  <div className="flex flex-col items-center mt-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-custom-merah"></div>
                    <p className="text-[12px] text-gray-500 mt-2 font-bold uppercase tracking-widest">
                      Mengirim Data...
                    </p>
                  </div>
                )}

                <button
                  onClick={() => (image ? handleSave() : setShowCamera(true))}
                  disabled={isLoading}
                  className={`flex w-full items-center justify-center ${
                    image ? "bg-green-600" : "bg-custom-merah"
                  } text-white font-bold rounded-[15px] py-3 mt-6 shadow-lg transition-all active:scale-95 ${
                    isLoading ? "opacity-50" : ""
                  }`}
                >
                  {isLoading
                    ? "PROSES..."
                    : image
                    ? "KIRIM SEKARANG"
                    : "BUKA KAMERA"}
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
