import React, { useState, useEffect, useRef } from "react";
import { RiCalendarScheduleFill } from "react-icons/ri";
import { FaNotesMedical } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import api from "../../shared/Api";
import { Avatar } from "@mui/material";
import { IoTrashBin } from "react-icons/io5";
import { FaPersonDigging } from "react-icons/fa6";
import { IoMdNotificationsOutline } from "react-icons/io";
//import dayjs from "dayjs";
import { IoMdClose } from "react-icons/io";

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
  const [izinDisetujui, setIzinDisetujui] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [izinStatus, setIzinStatus] = useState(null);
  const [isSakitHariIni, setIsSakitHariIni] = useState(false);

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

  const formatTanggalIndo = (tanggalString) => {
    if (!tanggalString) return "-";
    const bulanIndo = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    const [tahun, bulan, tanggal] = tanggalString.split("T")[0].split("-");
    return `${tanggal} ${bulanIndo[parseInt(bulan, 10) - 1]} ${tahun}`;
  };

  const fetchStatusIzin = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/perizinan/by-karyawan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data?.data || [];

      // Ambil data terakhir atau hari ini
      const today = new Date().toISOString().slice(0, 10);
      const todayData = data.find((item) => item.tgl_mulai?.includes(today));
      setIzinStatus(todayData || data[data.length - 1]); // fallback ke data terakhir
      setShowStatusModal(true);
    } catch (err) {
      console.error("Gagal mengambil status izin:", err);
      setIzinStatus(null);
      setShowStatusModal(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
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
        return;
      }

      try {
        const response = await api.get(`/absensi/check/${id_karyawan}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const presensi = response.data;
        console.log(response);
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

    fetchPresensi();
  }, []);

  useEffect(() => {
    const fetchIzinStatus = async () => {
      const id_karyawan = localStorage.getItem("id_karyawan");
      const token = localStorage.getItem("token");

      try {
        const res = await api.get(`/absensi/izin-sakit`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { id_karyawan },
        });

        const izinData = res.data.absensi || [];

        const today = new Date();
        const dd = String(today.getDate()).padStart(2, "0");
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const yyyy = today.getFullYear();
        const formattedToday = `${dd}-${mm}-${yyyy}`;

        const adaIzin = izinData.some(
          (item) =>
            item.tanggal === formattedToday &&
            item.status_absen?.toLowerCase() === "izin"
        );

        const adaSakit = izinData.some(
          (item) =>
            item.tanggal === formattedToday &&
            item.status_absen?.toLowerCase() === "sakit"
        );

        setIzinDisetujui(adaIzin);
        setIsSakitHariIni(adaSakit);
      } catch (err) {
        console.error("Gagal mengambil status izin/sakit:", err);
      }
    };

    fetchIzinStatus();
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
      await api.post("/auth/logout/karyawan");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.clear();
      window.location.replace("/login");
    }
  };

  const handleDelete = (id_absensi) => {
    if (window.confirm("Yakin ingin menghapus jam keluar ini?")) {
      const token = localStorage.getItem("token");
      api
        .delete(`/absensi/delete-check-out/${id_absensi}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          alert("Data berhasil dihapus!");
          window.location.reload();
        })
        .catch((err) => console.error("Gagal menghapus:", err));
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-custom-merah to-custom-gelap">
      <div className="Absensi">
        <div className="mt-0 ml-0 mr-0">
          <div className="block p-5 bg-white border border-gray-200 rounded-b-[60px] shadow-lg">
            <div className="Header left-0 mb-2 relative">
              <div
                className="absolute right-5 mt-0 flex items-center gap-2"
                ref={dropdownRef}
              >
                <IoMdNotificationsOutline
                  size={28}
                  className="text-black cursor-pointer hover:text-yellow-400 transition"
                  title="Lihat Status Izin"
                  onClick={() => {
                    setShowStatusModal(true);
                    fetchStatusIzin();
                  }}
                />
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
                  <div className="absolute left-0 top-full mt-2 z-50 text-left bg-custom-merah rounded-lg shadow-lg min-w-[80px] before:content-[''] before:absolute before:top-[-8px] before:left-4 before:border-8 before:border-transparent before:border-b-custom-merah">
                    <ul className="py-2">
                      <li
                        className="text-white px-4 py-2 hover:bg-custom-gelap cursor-pointer"
                        onClick={() => navigate("/profile")}
                      >
                        Profile
                      </li>
                      <li
                        className="text-white px-4 py-2 hover:bg-custom-gelap cursor-pointer"
                        onClick={() => navigate("/settings")}
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
            <div className="flex justify-center mt-4">
              {izinDisetujui || isSakitHariIni ? (
                <span className="text-black font-semibold">
                  {izinDisetujui
                    ? "Izin telah disetujui"
                    : "Status absen: Sakit"}
                </span>
              ) : isAbsenMasuk !== null ? (
                <button
                  type="button"
                  className="flex w-[150px] text-white items-center justify-center bg-custom-merah hover:bg-custom-gelap text-black font-medium rounded-[20px] px-2 py-2 shadow-md disabled:opacity-50"
                  onClick={handleAbsen}
                  disabled={izinDisetujui || isSakitHariIni}
                >
                  {isAbsenMasuk ? "Absen Masuk" : "Absen Pulang"}
                </button>
              ) : (
                <p className="font-semibold">
                  Terimakasih telah bekerja hari ini!
                </p>
              )}
            </div>

            {dataPresensi?.jam_terlambat > 0 && jamTerlambat && (
              <div className="flex justify-center mt-2">
                <span className="text-sm font-bold text-[#FF0000] px-4 py-1">
                  Anda terlambat {jamTerlambat} hari ini!
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-3 px-2 py-5 justify-center rounded-[20px]">
          <button
            onClick={() => navigate("/history")}
            className="flex items-center text-sm font-semibold bg-white hover:bg-gray-300 text-black rounded-[20px] px-3 py-2 shadow-md"
          >
            <div className="text-sm text-custom-merah pr-1">
              <RiCalendarScheduleFill />
            </div>
            History
          </button>
          <button
            onClick={() => navigate("/form-izin-sakit")}
            className="flex items-center text-sm font-semibold bg-white hover:bg-gray-300 text-black rounded-[20px] px-3 py-2 shadow-md"
          >
            <div className="text-sm text-custom-merah pr-1">
              <FaNotesMedical />
            </div>
            Izin/Sakit
          </button>
          <button
            onClick={() => navigate("/form-lembur")}
            className="flex items-center text-sm font-semibold bg-white hover:bg-gray-300 text-black rounded-[20px] px-3 py-2 shadow-md"
          >
            <div className="text-sm text-custom-merah pr-1">
              <FaPersonDigging />
            </div>
            Lembur
          </button>
        </div>

        {showStatusModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white text-black shadow-lg w-full max-w-md mx-4 rounded-lg flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-white z-10 rounded-t-lg">
                <h1 className="text-lg font-bold">Status Izin</h1>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="text-gray-500 hover:text-black text-xl"
                >
                  <IoMdClose size={25} />
                </button>
              </div>

              {/* Body dengan Tabel */}
              <div className="px-6 py-6 text-sm text-left">
                {izinStatus ? (
                  <table className="w-full border-separate border-spacing-y-2">
                    <tbody>
                      <tr>
                        <td className="font-semibold w-32 align-top">Mulai</td>
                        <td>: {formatTanggalIndo(izinStatus.tgl_mulai)}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold align-top">Selesai</td>
                        <td>: {formatTanggalIndo(izinStatus.tgl_selesai)}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold align-top">Alasan</td>
                        <td>: {toTitleCase(izinStatus.keterangan || "-")}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold align-top">Status</td>
                        <td>
                          :{" "}
                          <span
                            className={`font-bold ${
                              izinStatus.status_izin === "approved"
                                ? "text-green-600"
                                : izinStatus.status_izin === "pending"
                                ? "text-yellow-500"
                                : "text-red-600"
                            }`}
                          >
                            {toTitleCase(izinStatus.status_izin)}
                          </span>
                        </td>
                      </tr>
                      {izinStatus.status_izin === "rejected" && (
                        <tr>
                          <td className="font-semibold align-top">
                            Alasan Penolakan
                          </td>
                          <td>
                            :{" "}
                            {toTitleCase(
                              izinStatus.alasan_penolakan || "Tidak ada alasan"
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500 italic">
                    Tidak ada data izin tersedia.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div>
          <span className="Title flex pl-6 pt-2 text-xl text-white font-semibold">
            Presensi
          </span>
          <div className="block ml-2 mr-2 mt-3 bg-white border border-gray-200 rounded-[20px] shadow-lg relative">
            <div className="pt-2 pl-4 pb-2 pr-4 flex justify-between items-center font-semibold">
              <span>{getFormattedDate()}</span>
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
                onClick={() => {
                  handleDelete(dataPresensi.id_absensi);
                }}
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
