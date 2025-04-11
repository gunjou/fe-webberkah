import React, { useState, useEffect, useRef } from "react";
import { RiCalendarScheduleFill } from "react-icons/ri";
import { FaNotesMedical, FaUserEdit } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import api from "../../shared/Api";
import { Avatar } from "@mui/material";
import { IoClose, IoTrashBin } from "react-icons/io5";

const toTitleCase = (str) => {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getInitials = (name) => {
  if (!name) return "";
  const words = name.trim().split(" ");
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return words[0][0].toUpperCase();
};

const getOrCreateColor = () => {
  let color = localStorage.getItem("avatarColor");
  if (!color) {
    const colors = ["#6D28D9", "#DC2626", "#2563EB", "#059669", "#D97706"];
    color = colors[Math.floor(Math.random() * colors.length)];
    localStorage.setItem("avatarColor", color);
  }
  return color;
};

const formatMenitToJamMenit = (menitTotal) => {
  if (!menitTotal || menitTotal <= 0) return null;
  const jam = Math.floor(menitTotal / 60);
  const menit = menitTotal % 60;
  return `${jam > 0 ? jam + " jam " : ""}${menit > 0 ? menit + " menit" : ""}`;
};

const Absensi = () => {
  const nama = toTitleCase(localStorage.getItem("nama"));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAbsenMasuk, setIsAbsenMasuk] = useState(true);
  const [dataPresensi, setDataPresensi] = useState(null);
  const jamTerlambat = formatMenitToJamMenit(dataPresensi?.jam_terlambat);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const getFormattedDate = () => {
    const date = new Date();
    const options = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Makassar",
    };
    return new Intl.DateTimeFormat("id-ID", options).format(date);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false); // pastikan state dropdown kamu ini
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchPresensi = async () => {
      const id_karyawan = localStorage.getItem("id_karyawan");
      const token = localStorage.getItem("token");

      if (!id_karyawan || !token) {
        console.warn("Token atau ID karyawan belum tersedia");
        return; // jangan lanjut fetch kalau belum siap
      }

      try {
        const response = await api.get(`/cek_presensi/${id_karyawan}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const presensi = response.data;
        setDataPresensi(presensi);

        if (!presensi) {
          setIsAbsenMasuk(true);
        } else if (presensi.jam_masuk && !presensi.jam_keluar) {
          setIsAbsenMasuk(false);
        } else if (presensi.jam_masuk && presensi.jam_keluar) {
          setIsAbsenMasuk(null);
        }
      } catch (err) {
        console.error("Gagal mengambil data presensi.");
      }
    };

    // Kasih delay dikit atau trigger pakai event tertentu kalau perlu
    fetchPresensi();
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleAbsen = () => {
    navigate("/ambil-gambar", {
      state: {
        mode: isAbsenMasuk ? "checkin" : "checkout",
      },
    });
  };

  useEffect(() => {
    const statusAbsen = localStorage.getItem("statusAbsen");
    setIsAbsenMasuk(statusAbsen !== "pulang");
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/logout/karyawan");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.clear();
      window.location.href = "/login"; // kembali ke halaman login
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-custom-merah to-custom-gelap">
      <div className="Absensi">
        <div className="mt-0 ml-0 mr-0">
          <div className="block p-5 bg-white border border-gray-200 rounded-b-[60px] shadow-lg">
            <div className="Header left-0 mb-2">
              <div className="absolute right-5 mt-0" ref={dropdownRef}>
                <Avatar
                  onClick={toggleDropdown}
                  sx={{
                    bgcolor: getOrCreateColor(),
                    cursor: "pointer",
                    width: 40,
                    height: 40,
                    fontSize: "1rem",
                    fontWeight: "bold",
                  }}
                >
                  {getInitials(localStorage.getItem("nama"))}
                </Avatar>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 z-50 text-left bg-custom-merah rounded-lg shadow-lg min-w-fit">
                    <div className="px-4 py-2 border-b border-white text-white whitespace-nowrap font-semibold">
                      {toTitleCase(localStorage.getItem("nama"))}
                    </div>
                    <ul className="py-2">
                      <li
                        className="text-white px-4 py-2 hover:bg-custom-gelap cursor-pointer"
                        onClick={() => navigate("/m-develop")}
                      >
                        Profile
                      </li>
                      <li
                        className="text-white px-4 py-2 hover:bg-custom-gelap cursor-pointer"
                        onClick={() => navigate("/m-develop")}
                      >
                        Settings
                      </li>
                      <li
                        className="text-white font-bold px-4 py-2 hover:bg-custom-gelap cursor-pointer"
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
                )}
              </div>
              <span className="flex text-lg">Hallo,</span>
              <h1 className="flex text-2xl font-semibold">{nama}</h1>
            </div>

            <div className="grid grid-cols-2 gap-2 pb-3">
              <h2 className="flex text-lg font-semibold">Jam Kerja:</h2>
              <div className="flex absolute right-5">{getFormattedDate()}</div>
            </div>
            <div className="text-4xl font-bold pb-4">08:00 - 17:00</div>
            {isAbsenMasuk !== null ? (
              <>
                <div className="flex justify-center">
                  <button
                    type="button"
                    className="flex w-[150px] text-white items-center justify-center bg-custom-merah hover:bg-custom-gelap text-black font-medium rounded-[20px] px-2 py-2 shadow-md"
                    onClick={handleAbsen}
                  >
                    {isAbsenMasuk ? "Absen Masuk" : "Absen Pulang"}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex justify-center mt-4 pb-1">
                <p className="font-semibold">
                  Terimakasih telah bekerja hari ini!
                </p>
              </div>
            )}

            {/* Peringatan terlambat ditampilkan jika sudah absen masuk dan terlambat */}
            {dataPresensi?.jam_terlambat > 0 && jamTerlambat && (
              <div className="flex justify-center mt-2">
                <span className="text-sm font-bold text-[#FF0000] px-4 py-1">
                  Anda terlambat {jamTerlambat} hari ini!
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-1 px-2 py-5 justify-center rounded-[20px]">
          <button
            onClick={() => navigate("/m-develop")}
            className="flex items-center bg-white hover:bg-gray-300 text-black rounded-full px-3 py-2 shadow-md"
          >
            <div className="text-[10pt] text-custom-merah pr-1">
              <RiCalendarScheduleFill />
            </div>
            History
          </button>
          <button
            onClick={() => navigate("/m-develop")}
            className="flex items-center bg-white hover:bg-gray-300 text-black rounded-[20px] px-2 py-2 shadow-md"
          >
            <div className="text-[10pt] text-custom-merah pr-1">
              <FaNotesMedical />
            </div>
            Izin/Sakit
          </button>
          <button
            onClick={() => navigate("/m-develop")}
            className="flex items-center bg-white hover:bg-gray-300 text-black rounded-[20px] px-2 py-2 shadow-md"
          >
            <div className="text-[10pt] text-custom-merah pr-1">
              <FaUserEdit />
            </div>
            Form Cuti
          </button>
        </div>

        <div>
          <span className="Title flex pl-6 pt-2 text-xl text-white font-semibold">
            Presensi
          </span>
          <div className="block ml-2 mr-2 mt-3 bg-white border border-gray-200 rounded-[20px] shadow-lg relative">
            <div className="pt-2 pl-4 pb-2 pr-4 flex justify-between items-center font-semibold">
              <span>{getFormattedDate()}</span>
              <button
                onClick={() => alert("Hapus data absensi masuk")}
                className="flex items-center absolute right-7  text-custom-merah hover:text-red-700"
                title="Hapus"
              >
                <IoTrashBin className="mr-1" />
                Hapus
              </button>
            </div>
            <div className="pl-4 grid grid-cols-2">
              <div className="flex pl-0.5 pb-2">
                <p className="text-xl pt-0.5 pr-2 text-custom-merah">
                  <FaLocationDot />
                  <span className="text-sm font-semibold">
                    {dataPresensi?.lokasi_masuk || "Belum absensi masuk"}
                  </span>
                </p>
              </div>
              <span className="text-md font-semibold absolute right-7 text-custom-merah">
                Jam Masuk: <br />
                <span className="text-xl font-bold">
                  {dataPresensi?.jam_masuk || "--:--"}
                </span>
              </span>
            </div>
          </div>

          <div className="block ml-2 mr-2 mt-3 bg-white border border-gray-200 rounded-[20px] shadow-lg relative">
            <div className="pt-2 pl-4 pb-2 pr-4 flex justify-between items-center font-semibold">
              <span>{getFormattedDate()}</span>
              <button
                onClick={() => alert("Hapus data absensi keluar")}
                className="flex items-center absolute right-7 text-custom-merah hover:text-red-700"
                title="Hapus"
              >
                <IoTrashBin className="mr-1" />
                Hapus
              </button>
            </div>
            <div className="pl-4 grid grid-cols-2">
              <div className="flex pl-0.5 pb-2">
                <p className="text-xl pt-0.5 pr-2 text-custom-merah">
                  <FaLocationDot />
                  <span className="text-sm font-semibold">
                    {dataPresensi?.lokasi_keluar || "Belum absensi keluar"}
                  </span>
                </p>
              </div>
              <span className="text-md font-semibold absolute right-7 text-custom-merah">
                Jam Keluar: <br />
                <span className="text-xl font-bold">
                  {dataPresensi?.jam_keluar || "--:--"}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Absensi;
