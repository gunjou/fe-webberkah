import { React, useState, useEffect } from "react";
import { RiCalendarScheduleFill } from "react-icons/ri";
import { MdHealthAndSafety } from "react-icons/md";
import { FaClipboardList, FaNotesMedical, FaStreetView } from "react-icons/fa";
import { FaLocationDot, FaUserPen } from "react-icons/fa6";
import { MdOutlineAccountCircle } from "react-icons/md"; // Tambahkan ikon akun
import CameraComponent from "./components/CameraComponent";
import { useNavigate } from "react-router-dom";
import { RxDropdownMenu } from "react-icons/rx";
import { CgProfile } from "react-icons/cg";

const Absensi = () => {
  const [image, setImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false); // State untuk mengontrol tampilan kamera
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State untuk dropdown
  const [isAbsenMasuk, setIsAbsenMasuk] = useState(true); // State untuk status absen masuk
  const navigate = useNavigate();

  const handleCapture = (imageSrc) => {
    setImage(imageSrc); // Simpan gambar yang diambil ke state
  };

  const handleOpenCamera = () => {
    setShowCamera(true); // Tampilkan kamera
  };

  const handleCloseCamera = () => {
    setShowCamera(false); // Sembunyikan kamera
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen); // Toggle dropdown
  };

  const handleAbsen = () => {
    navigate("/ambil-gambar"); // Navigasi ke halaman ambil gambar
  };

  useEffect(() => {
    // Cek status absen dari localStorage
    const statusAbsen = localStorage.getItem("statusAbsen");
    if (statusAbsen === "pulang") {
      setIsAbsenMasuk(false);
    } else {
      setIsAbsenMasuk(true);
    }
  }, []);

  const goToAmbilGambar = () => {
    navigate("/ambil-gambar");
  };

  return (
    <div className="bg-gradient-to-b from-custom-merah to-custom-gelap pb-[900px]">
      <div className="Absensi">
        {/* Card Absensi */}
        <div className="mt-0 ml-0 mr-0">
          <div className="block p-5 bg-white border border-gray-200 rounded-b-[60px] shadow-lg">
            {/* Haeder */}
            <div className="Header left-0 mb-2">
              {/* Dropdown Menu */}
              <div className="absolute right-5 mt-0 ">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center bg-white text-black rounded-[20px] hover:bg-gray-100 shadow-md font-semibold py-2 px-4  "
                >
                  <RxDropdownMenu className="text-[30px]" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 z-50 text-left bg-custom-merah rounded-lg shadow-lg">
                    <ul className="py-2">
                      <li className="text-white px-4 py-2 hover:bg-custom-gelap cursor-pointer">
                        Profile
                      </li>
                      <li className="text-white px-4 py-2 hover:bg-custom-gelap cursor-pointer">
                        Settings
                      </li>
                      <li
                        className="text-white font-bold px-4 py-2 hover:bg-custom-gelap cursor-pointer"
                        onClick={() => alert("Logout")}
                      >
                        Logout
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              <span className="flex text-lg">Hallo,</span>

              <h1 className="flex text-2xl font-semibold">Gugun Jofandi</h1>
            </div>
            {/* End Header */}
            <div className="grid grid-cols-2 gap-2 pb-6">
              <h2 className="flex text-lg font-semibold">Jam Kerja:</h2>
              <div className="flex absolute right-5">Senin, 10 Mar 2025</div>
            </div>
            <div className="text-4xl font-bold pb-7">08:00 - 17:00</div>
            <div className="flex justify-center">
              <button
                type="button"
                className={`flex w-[150px] text-white items-center justify-center ${
                  isAbsenMasuk
                    ? "bg-custom-merah hover:bg-custom-gelap"
                    : "bg-custom-merah hover:bg-custom-gelap"
                } text-black font-medium rounded-[20px] px-2 py-2 shadow-md`}
                onClick={handleAbsen}
              >
                {isAbsenMasuk ? "Absen Masuk" : "Absen Pulang"}
              </button>
            </div>
          </div>
        </div>
        {/* End card abesnsi */}

        <div class="flex space-x-1 px-2 py-3 justify-center rounded-[20px]">
          <button class="flex items-center bg-white hover:bg-gray-300 text-black rounded-full px-3 py-2 shadow-md">
            <div className="text-[20pt] text-custom-merah pr-1">
              <RiCalendarScheduleFill />
            </div>
            History
          </button>
          <button class="flex items-center bg-white hover:bg-gray-300 text-black rounded-[20px] px-2 py-2 shadow-md">
            <div className="text-[20pt] text-custom-merah pr-1">
              <FaNotesMedical />
            </div>
            Izin/Sakit
          </button>
          <button class="flex items-center bg-white hover:bg-gray-300 text-black rounded-[20px] px-2 py-2 shadow-md">
            <div className="text-[20pt] text-custom-merah pr-1">
              <FaUserPen />
            </div>
            Form Cuti
          </button>
        </div>

        <div>
          <span className="Title flex pl-6 text-xl text-white font-semibold">
            Presensi
          </span>
          <div className="block ml-2 mr-2 mt-3 bg-white border border-gray-200 rounded-[20px] shadow-lg">
            <p className="pt-2 pl-4 pb-2 flex font-semibold">
              Senin, 10 Maret 2025
            </p>
            <div className="pl-4 grid grid-cols-2">
              <div className="flex pl-0.5 pb-4">
                <p className="text-xl pt-0.5 pr-2 text-red-700">
                  <FaLocationDot />
                </p>
                <span className="text-md"></span>
              </div>
              <span className="text-md font-semibold absolute right-5">
                Jam Masuk:
              </span>
            </div>
          </div>

          <div className="block ml-2 mr-2 mt-3 bg-white border border-gray-200 rounded-[20px] shadow-lg">
            <p className="pt-2 pl-4 pb-2 flex font-semibold">
              Senin, 10 Maret 2025
            </p>
            <div className="pl-4 grid grid-cols-2">
              <div className="flex pl-0.5` pb-4">
                <p className="text-xl pt-0.5 pr-2 text-red-700">
                  <FaLocationDot />
                </p>
                <span className="text-md"></span>
              </div>
              <span className="text-md font-semibold absolute right-5">
                Jam Keluar:
              </span>
            </div>
          </div>
        </div>
        {/* End Presensi */}
      </div>
    </div>
  );
};

export default Absensi;
