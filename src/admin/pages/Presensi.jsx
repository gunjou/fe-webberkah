import { React, useState, useEffect } from "react";
import { Card } from "flowbite-react";
import { PiOfficeChairBold } from "react-icons/pi";
import { FaHelmetSafety } from "react-icons/fa6";
import { MdOutlineHealthAndSafety } from "react-icons/md";
import { ImCross } from "react-icons/im";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { IoMdNotificationsOutline } from "react-icons/io";
//import Badge from "@mui/material/Badge";
import { IoMdClose } from "react-icons/io";

import api from "../../shared/Api";
import apiUpload from "../../shared/ApiUpload";

import { FaCheck, FaPlus } from "react-icons/fa";
import ModalHadir from "../components/ModalHadir";

const Presensi = () => {
  const [openHadir, setOpenHadir] = useState(false);
  const handleOpenHadir = (type) => {
    setModalType(type);
    setOpenHadir(true);
  };

  const handleCloseHadir = () => setOpenHadir(false);
  const [absen, setAbsen] = useState([]);
  const [karyawan, setKaryawan] = useState([]);
  const [jumlahNonDireksi, setJumlahNonDireksi] = useState(0);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalType, setModalType] = useState("hadir");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [notifCount, setNotifCount] = useState(0);
  const [notifList, setNotifList] = useState([]);
  const [notifModal, setNotifModal] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState("");
  const [izinModal, setIzinModal] = useState(false);
  const [izinList, setIzinList] = useState([]);
  const [izinLoading, setIzinLoading] = useState(false);
  const [izinError, setIzinError] = useState("");
  const [izinFilterTanggal, setIzinFilterTanggal] = useState(null);

  const [izinSelectedMonth, setIzinSelectedMonth] = useState(
    new Date().getMonth() + 1
  );
  const [izinSelectedYear, setIzinSelectedYear] = useState(
    new Date().getFullYear()
  );
  const [izinActionLoading, setIzinActionLoading] = useState(null);
  const [rejectId, setRejectId] = useState(null);
  const [alasanReject, setAlasanReject] = useState({});
  const [absensiIzinSakit, setAbsensiIzinSakit] = useState([]);
  const [tidakHadirList, setTidakHadirList] = useState([]);
  const [fileBlobs, setFileBlobs] = useState({});

  const getFormattedDate = () => {
    const date = new Date();
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Makassar",
    }).format(date);
  };

  const formatDateParam = (dateObj) => {
    return dayjs(dateObj).format("DD-MM-YYYY");
  };

  useEffect(() => {
    setFilteredData(absen);
    setSearchTerm("");
  }, [absen]);

  useEffect(() => {
    api
      .get("/pegawai/")
      .then((res) => {
        const sorted = res.data
          .filter((item) => item.nama)
          .sort((a, b) => a.nama.localeCompare(b.nama));

        setKaryawan(sorted);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  useEffect(() => {
    api
      .get("/pegawai/jumlah-non-direksi")
      .then((res) => {
        if (
          res.data.status === "success" &&
          typeof res.data.jumlah === "number"
        ) {
          setJumlahNonDireksi(res.data.jumlah);
        } else {
          console.warn("Format data tidak sesuai:", res.data);
        }
      })
      .catch((error) => {
        console.error("Gagal mengambil jumlah non-direksi:", error);
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const formattedDate = formatDateParam(selectedDate);
    api
      .get(`/absensi/hadir?tanggal=${formattedDate}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setAbsen(res.data.absensi);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [selectedDate]);

  const fetchNotifCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/notifikasi?role=admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifCount(res.data.count || 0);
      setNotifList(res.data.data || []);
    } catch (err) {
      setNotifCount(0);
      setNotifList([]);
    }
  };

  useEffect(() => {
    fetchNotifCount();
  }, []);

  const getMonthDateRange = (date) => {
    const start = dayjs(date).startOf("month").format("YYYY-MM-DD");
    const end = dayjs(date).endOf("month").format("YYYY-MM-DD");
    return { start, end };
  };

  const fetchIzinList = async () => {
    setIzinLoading(true);
    setIzinError("");
    try {
      const token = localStorage.getItem("token");

      const start = `${izinSelectedYear}-${String(izinSelectedMonth).padStart(
        2,
        "0"
      )}-01`;
      const end = new Date(izinSelectedYear, izinSelectedMonth, 0)
        .toISOString()
        .split("T")[0];

      const url = `/perizinan-new/?start_date=${start}&end_date=${end}`;

      const res = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data.data;
      setIzinList(Array.isArray(data) ? data : data ? [data] : []);

      (data || []).forEach((item) => {
        if (item.path_lampiran)
          fetchFileWithToken(item.path_lampiran, item.id_izin);
      });
    } catch (err) {
      setIzinError("Gagal memuat data pengajuan izin.");
      setIzinList([]);
    } finally {
      setIzinLoading(false);
    }
  };

  const fetchFileWithToken = async (path, id_izin) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://api.berkahangsana.com/perizinan/preview/${path}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Gagal ambil file.");

      const blob = await res.blob();
      const objectURL = URL.createObjectURL(blob);

      setFileBlobs((prev) => ({ ...prev, [id_izin]: objectURL }));
    } catch (err) {
      console.error("Gagal ambil file preview:", err);
    }
  };

  useEffect(() => {
    if (izinModal) fetchIzinList();
  }, [izinModal, izinSelectedMonth, izinSelectedYear]);

  const handleViewFile = (url) => {
    if (!url) {
      alert("Lampiran tidak tersedia");
      return;
    }

    const finalUrl = encodeURI(url);
    window.open(finalUrl, "_blank", "noopener,noreferrer");
  };

  const fetchAbsensiIzinSakit = async (tanggal) => {
    const token = localStorage.getItem("token");
    const tglFormatted = dayjs(tanggal).format("DD-MM-YYYY");

    try {
      const res = await api.get(`/absensi/izin-sakit?tanggal=${tglFormatted}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data?.absensi || [];
      setAbsensiIzinSakit(data);
    } catch (err) {
      console.error("Gagal ambil data izin/sakit:", err);
      setAbsensiIzinSakit([]);
    }
  };

  useEffect(() => {
    fetchAbsensiIzinSakit(selectedDate);
  }, [selectedDate]);

  const handleApproveIzin = async (id_izin) => {
    if (!window.confirm("Setujui pengajuan izin ini?")) return;
    setIzinActionLoading(id_izin);
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/perizinan-new/approve/${id_izin}`,
        {},
        {
          headers: {
            "Content-Type": undefined,
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchIzinList(izinFilterTanggal);
    } catch (err) {
      alert("Gagal approve izin!");
    } finally {
      setIzinActionLoading(null);
    }
  };

  const handleApproveCuti = async (id_izin) => {
    if (!window.confirm("Setujui pengajuan izin ini dan potong cuti?")) return;
    setIzinActionLoading(id_izin);
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/perizinan/${id_izin}/setujui-potong-cuti`,
        {},
        {
          headers: {
            "Content-Type": undefined,
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchIzinList(izinFilterTanggal);
    } catch (err) {
      alert("Gagal approve izin (potong cuti)!");
    } finally {
      setIzinActionLoading(null);
    }
  };

  const handleRejectIzin = async (id_izin) => {
    if (!alasanReject[id_izin] || !alasanReject[id_izin].trim()) {
      alert("Alasan penolakan wajib diisi!");
      return;
    }

    setIzinActionLoading(id_izin);

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("alasan", alasanReject[id_izin]);

      await apiUpload.put(`/perizinan-new/reject/${id_izin}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // ❗ JANGAN set Content-Type manual
        },
      });

      setRejectId(null);
      setAlasanReject({});
      fetchIzinList();
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Gagal reject izin!");
    } finally {
      setIzinActionLoading(null);
    }
  };

  const handleDeleteIzin = async (id_izin) => {
    if (!window.confirm("Yakin ingin menghapus pengajuan izin ini?")) return;

    setIzinActionLoading(id_izin);
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/perizinan-new/delete/${id_izin}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchIzinList(izinFilterTanggal); // refresh daftar izin
    } catch (err) {
      alert("Gagal menghapus pengajuan izin.");
    } finally {
      setIzinActionLoading(null);
    }
  };

  const openNotifModal = () => {
    setNotifModal(true);
    fetchNotifCount();
  };

  const fetchTidakHadir = async (tanggal) => {
    const token = localStorage.getItem("token");
    const tglFormatted = dayjs(tanggal).format("DD-MM-YYYY");

    try {
      const res = await api.get(
        `/absensi/tidak-hadir?tanggal=${tglFormatted}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = res.data?.absensi || [];
      setTidakHadirList(data);
    } catch (err) {
      console.error("Gagal ambil data tidak hadir:", err);
      setTidakHadirList([]);
    }
  };
  useEffect(() => {
    fetchTidakHadir(selectedDate);
  }, [selectedDate]);

  return (
    <div className="Presensi">
      {/* Header */}
      {/* <NavMenu /> */}
      <div className="Body flex">
        {/* <SideMenu /> */}
        {/* Dashboard Presensi */}
        <div>
          <div className="pt-5 pl-4 flex items-center gap-2">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Pilih Tanggal"
                value={selectedDate}
                onChange={(newVal) => setSelectedDate(newVal)}
                format="DD-MM-YYYY"
                slotProps={{
                  textField: {
                    size: "small",
                    sx: { minWidth: 180 },
                  },
                }}
              />
            </LocalizationProvider>
            <button
              type="button"
              className="flex items-center gap-2 bg-red-800 hover:bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded shadow"
              onClick={() => setIzinModal(true)}
            >
              Lihat Pengajuan Izin
            </button>
          </div>
          <div className="title flex text-2xl pt-2 pl-4 font-bold">
            Persensi Semua Pegawai
          </div>
          <div className="flex space-x-4 px-2 py-3 justify-center rounded-[20px]">
            <div className="card h-50 w-80">
              <Card
                href="#"
                onClick={() => handleOpenHadir("hadir")}
                className="cursor-pointer relative"
              >
                <div className="absolute top-4 left-5">
                  <h5 className="text-lg font-normal tracking-tight text-gray-900 dark:text-white">
                    Hadir
                  </h5>
                </div>
                <div className="mt-7 text-left ml-0">
                  <p className="font-bold text-2xl text-black-700 dark:text-gray-400">
                    {absen.length}/{jumlahNonDireksi}
                  </p>
                  <p className="font-normal text-red-700 dark:text-gray-400">
                    Orang
                  </p>
                </div>
                <span className="flex items-center justify-center absolute top-4 right-4 text-blue-700 text-3xl text-center w-8 h-8 rounded-md bg-blue-400">
                  <FaCheck className="h-6 w-6" />
                </span>
              </Card>
            </div>
            <div className="card h-50 w-80">
              <div className="card">
                <Card
                  href="#"
                  onClick={() => handleOpenHadir("izin_sakit")}
                  className="cursor-pointer relative"
                >
                  <div className="absolute top-4 left-5">
                    <h5 className="text-lg font-normal tracking-tight text-gray-900 dark:text-white">
                      Izin/Sakit
                    </h5>
                  </div>
                  <div className="mt-7 text-left ml-0">
                    <p className="font-bold text-2xl text-black-700 dark:text-gray-400">
                      {absensiIzinSakit.length}/{jumlahNonDireksi}
                    </p>

                    <p className="font-normal text-red-700 dark:text-gray-400">
                      Orang
                    </p>
                  </div>
                  <span className="flex items-center justify-center absolute top-4 right-4 text-green-700 text-3xl text-center w-8 h-8 rounded-md bg-green-400">
                    <FaPlus className="h-6 w-6" />
                  </span>
                </Card>
              </div>
            </div>
            <div className="card h-50 w-80">
              <div className="card">
                <Card
                  href="#"
                  onClick={() => handleOpenHadir("tanpa_keterangan")}
                  className="cursor-pointer relative"
                >
                  <div className="absolute top-4 left-5">
                    <h5 className="text-lg font-normal tracking-tight text-gray-900 dark:text-white">
                      Tanpa Keterangan
                    </h5>
                  </div>
                  <div className="mt-7 text-left ml-0">
                    <p className="font-bold text-2xl text-black-700 dark:text-gray-400">
                      {tidakHadirList.length}/{jumlahNonDireksi}
                    </p>
                    <p className="font-normal text-red-700 dark:text-gray-400">
                      Orang
                    </p>
                  </div>
                  <span className="flex items-center justify-center absolute top-4 right-4 text-red-700 text-3xl text-center w-8 h-8 rounded-md bg-red-400">
                    <ImCross className="h-6 w-6" />
                  </span>
                </Card>
              </div>
            </div>
          </div>
          <div className="title flex text-2xl pt-4 pl-4 font-bold">
            Persensi Departemen Pegawai
          </div>
          <div className="flex space-x-4 px-2 py-3 justify-center rounded-[20px]">
            <div className="card h-50 w-80">
              <Card
                href="#"
                onClick={() => handleOpenHadir("staff")}
                className="cursor-pointer relative"
              >
                <div className="absolute top-4 left-5">
                  <h5 className="text-lg font-normal tracking-tight text-gray-900 dark:text-white">
                    Staff Kantor
                  </h5>
                </div>
                <div className="mt-7 text-left ml-0">
                  <p className="font-bold text-2xl text-black-700 dark:text-gray-400">
                    {absen.filter((item) => item.id_jenis === 4).length}/
                    {karyawan.filter((item) => item.id_jenis === 4).length}
                  </p>
                  <p className="font-normal text-red-700 dark:text-gray-400">
                    Orang
                  </p>
                </div>
                <span className="flex items-center justify-center absolute top-4 right-4 text-yellow-700 text-3xl text-center w-8 h-8 rounded-md bg-yellow-400">
                  <PiOfficeChairBold className="h-6 w-6" />
                </span>
              </Card>
            </div>
            <div className="card h-50 w-80">
              <Card
                href="#"
                onClick={() => handleOpenHadir("pegawai_lapangan")}
                className="cursor-pointer relative"
              >
                <div className="absolute top-4 left-5">
                  <h5 className="text-lg font-normal tracking-tight text-gray-900 dark:text-white">
                    Pegawai Lapangan
                  </h5>
                </div>

                <div className="mt-7 text-left ml-0">
                  <p className="font-bold text-2xl text-black-700 dark:text-gray-400">
                    {
                      absen.filter(
                        (item) => item.id_jenis === 5
                        // (item) => item.id_jenis === 5 || item.id_jenis === 6
                      ).length
                    }
                    /{karyawan.filter((item) => item.id_jenis === 5).length}
                  </p>
                  <p className="font-normal text-red-700 dark:text-gray-400">
                    Orang
                  </p>
                </div>
                <span className="flex items-center justify-center absolute top-4 right-4 text-blue-700 text-3xl text-center w-8 h-8 rounded-md bg-blue-400">
                  <FaHelmetSafety className="h-6 w-6" />
                </span>
              </Card>
            </div>
            <div className="card h-50 w-80">
              <Card
                href="#"
                onClick={() => handleOpenHadir("cleaning_services")}
                className="cursor-pointer relative"
              >
                <div className="absolute top-4 left-5">
                  <h5 className="text-lg font-normal tracking-tight text-gray-900 dark:text-white">
                    K3 Lapangan
                  </h5>
                </div>
                <div className="mt-7 text-left ml-0">
                  <p className="font-bold text-2xl text-black-700 dark:text-gray-400">
                    {absen.filter((item) => item.id_jenis === 6).length}/
                    {karyawan.filter((item) => item.id_jenis === 6).length}
                  </p>
                  <p className="font-normal text-red-700 dark:text-gray-400">
                    Orang
                  </p>
                </div>
                <span className="flex items-center justify-center absolute top-4 right-4 text-green-700 text-3xl text-center w-8 h-8 rounded-md bg-green-400">
                  <MdOutlineHealthAndSafety className="h-6 w-6" />
                </span>
              </Card>
            </div>
          </div>
        </div>
      </div>
      {notifModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white text-black rounded-lg shadow-lg w-full max-w-2xl mx-4 relative flex flex-col max-h-[90vh]">
            <div className="flex-shrink-0 flex items-center justify-between border-b px-6 py-4 bg-white sticky top-0 z-10">
              <h1 className="text-xl font-bold text-left">
                Permintaan Izin/Sakit
              </h1>
              <button
                onClick={() => setNotifModal(false)}
                className="text-gray-500 hover:text-black text-xl"
                aria-label="Tutup"
              >
                <IoMdNotificationsOutline size={25} />
              </button>
            </div>
            <div className="px-6 py-2 overflow-y-auto flex-1">
              {notifLoading ? (
                <div className="flex justify-center py-8">
                  <span>Memuat data...</span>
                </div>
              ) : notifError ? (
                <div className="text-red-500 text-center">{notifError}</div>
              ) : notifList.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  Tidak ada permintaan izin/sakit baru.
                </div>
              ) : (
                <div className="space-y-4">
                  {notifList.map((item, idx) => (
                    <div
                      key={item.id_notifikasi || idx}
                      className="border rounded-lg p-4 bg-gray-50 shadow-sm text-left"
                    >
                      <div className="mb-1 flex">
                        <span className="font-semibold w-36 inline-block">
                          Nama
                        </span>
                        <span className="mr-2">:</span>
                        <span>{item.nama_karyawan || "-"}</span>
                      </div>
                      <div className="mb-1 flex">
                        <span className="font-semibold w-36 inline-block">
                          Jenis
                        </span>
                        <span className="mr-2">:</span>
                        <span>{item.nama_status || "-"}</span>
                      </div>
                      <div className="mb-1 flex">
                        <span className="font-semibold w-36 inline-block">
                          Tanggal
                        </span>
                        <span className="mr-2">:</span>
                        <span>
                          {item.tgl_mulai || "-"} s/d {item.tgl_selesai || "-"}
                        </span>
                      </div>
                      <div className="mb-1 flex">
                        <span className="font-semibold w-36 inline-block">
                          Keterangan
                        </span>
                        <span className="mr-2">:</span>
                        <span>{item.keterangan || "-"}</span>
                      </div>
                      <div className="mb-1 flex">
                        <span className="font-semibold w-36 inline-block">
                          Status
                        </span>
                        <span className="mr-2">:</span>
                        <span className="font-bold">{item.status || "-"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-shrink-0 flex justify-end border-t px-6 py-3 bg-white sticky bottom-0 z-10">
              <button
                onClick={() => setNotifModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {izinModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          onClick={() => setIzinModal(false)}
        >
          <div
            className="bg-white text-black rounded-lg shadow-lg w-full max-w-5xl mx-4 relative flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {" "}
            {/* Lebar table modal */}
            <div className="flex-shrink-0 flex items-center justify-between border-b px-6 py-4 bg-white sticky top-0 z-10">
              <h1 className="text-xl font-bold text-left">
                Data Pengajuan Izin/Sakit
              </h1>
              <button
                onClick={() => setIzinModal(false)}
                className="text-gray-500 hover:text-black text-xl"
                aria-label="Tutup"
              >
                <IoMdClose size={25} />
              </button>
            </div>
            <div className="px-6 pt-4 pb-2 flex items-center gap-2">
              <select
                value={izinSelectedMonth}
                onChange={(e) => setIzinSelectedMonth(Number(e.target.value))}
                className="px-2 py-2 border rounded-lg text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString("id-ID", { month: "long" })}
                  </option>
                ))}
              </select>

              <select
                value={izinSelectedYear}
                onChange={(e) => setIzinSelectedYear(Number(e.target.value))}
                className="px-2 py-2 border rounded-lg text-sm"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>

              {izinFilterTanggal && (
                <button
                  className="ml-2 text-xs text-red-500 underline"
                  onClick={() => setIzinFilterTanggal(null)}
                  type="button"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="px-6 py-2 overflow-y-auto flex-1">
              {izinLoading ? (
                <div className="flex justify-center py-8">
                  <span>Memuat data...</span>
                </div>
              ) : izinError ? (
                <div className="text-red-500 text-center">{izinError}</div>
              ) : izinList.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  Tidak ada pengajuan izin/sakit.
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[60vh]">
                  <table className="min-w-full border text-sm">
                    <thead className="sticky top-0 z-10 bg-white shadow">
                      <tr className="bg-gray-100">
                        <th className="border px-2 py-1">Nama</th>
                        <th className="border px-2 py-1 w-[90px]">Jenis</th>
                        <th className="border px-2 py-1">Tanggal Mulai</th>
                        <th className="border px-2 py-1">Tanggal Selesai</th>
                        <th className="border px-2 py-1">Keterangan</th>
                        <th className="border px-2 py-1">Lampiran</th>
                        <th className="border px-2 py-1 w-[130px]">Status</th>
                        <th className="border px-2 py-1">Aksi</th>
                      </tr>
                    </thead>

                    <tbody>
                      {izinList.map((item) => (
                        <tr key={item.id_izin}>
                          <td className="border px-2 py-1">
                            {item.nama_karyawan
                              ? item.nama_karyawan.replace(/\b\w/g, (c) =>
                                  c.toUpperCase()
                                )
                              : "-"}
                          </td>
                          <td className="border px-2 py-1">
                            {item.nama_status || "-"}
                          </td>
                          <td className="border px-2 py-1">
                            {item.tgl_mulai
                              ? dayjs(item.tgl_mulai).format("DD-MM-YYYY")
                              : "-"}
                          </td>
                          <td className="border px-2 py-1">
                            {item.tgl_selesai
                              ? dayjs(item.tgl_selesai).format("DD-MM-YYYY")
                              : "-"}
                          </td>
                          {/* <td className="border px-2 py-1">
                            {item.durasi_izin
                              ? `${item.durasi_izin} hari`
                              : "-"}
                          </td> */}
                          <td className="border px-2 py-1">
                            {item.keterangan || "-"}
                          </td>
                          <td className="border px-2 py-1 text-center">
                            {item.path_lampiran ? (
                              <button
                                onClick={() =>
                                  handleViewFile(
                                    item.path_lampiran,
                                    item.id_izin
                                  )
                                }
                                className="text-blue-600 hover:underline text-sm"
                              >
                                Lihat File
                              </button>
                            ) : (
                              "-"
                            )}
                          </td>

                          <td className="border px-2 py-1 font-semibold">
                            <span
                              className={
                                item.status_izin === "approved"
                                  ? "text-green-600"
                                  : item.status_izin === "approved (-cuti)"
                                  ? "text-lime-600"
                                  : item.status_izin === "pending"
                                  ? "text-yellow-600"
                                  : item.status_izin === "rejected"
                                  ? "text-red-600"
                                  : ""
                              }
                            >
                              {item.status_izin
                                ? item.status_izin.charAt(0).toUpperCase() +
                                  item.status_izin.slice(1)
                                : "-"}
                            </span>
                          </td>
                          <td className="border px-2 py-1">
                            {item.status_izin === "pending" ? (
                              rejectId === item.id_izin ? (
                                <div className="flex flex-col gap-1">
                                  <input
                                    type="text"
                                    className="border px-2 py-1 rounded text-xs"
                                    placeholder="Alasan penolakan"
                                    value={alasanReject[item.id_izin] || ""}
                                    onChange={(e) =>
                                      setAlasanReject({
                                        ...alasanReject,
                                        [item.id_izin]: e.target.value,
                                      })
                                    }
                                    disabled={
                                      izinActionLoading === item.id_izin
                                    }
                                  />
                                  <div className="flex gap-1">
                                    <button
                                      className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                                      onClick={() =>
                                        handleRejectIzin(item.id_izin)
                                      }
                                      disabled={
                                        izinActionLoading === item.id_izin
                                      }
                                    >
                                      {izinActionLoading === item.id_izin
                                        ? "Memproses..."
                                        : "Tolak"}
                                    </button>
                                    <button
                                      className="bg-gray-300 hover:bg-gray-400 text-black px-2 py-1 rounded text-xs"
                                      onClick={() => {
                                        setRejectId(null);
                                        setAlasanReject({});
                                      }}
                                      type="button"
                                    >
                                      Batal
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex gap-1">
                                  <button
                                    className="bg-green-500 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                                    onClick={() =>
                                      handleApproveIzin(item.id_izin)
                                    }
                                    disabled={
                                      izinActionLoading === item.id_izin
                                    }
                                  >
                                    {izinActionLoading === item.id_izin
                                      ? "Memproses..."
                                      : "Approve"}
                                  </button>
                                  <button
                                    className="bg-lime-600 hover:bg-lime-700 text-white px-2 py-1 rounded text-xs whitespace-nowrap"
                                    onClick={() =>
                                      handleApproveCuti(item.id_izin)
                                    }
                                    disabled={
                                      izinActionLoading === item.id_izin
                                    }
                                  >
                                    {izinActionLoading === item.id_izin
                                      ? "Memproses..."
                                      : "-Cuti"}
                                  </button>
                                  <button
                                    className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                                    onClick={() => {
                                      setRejectId(item.id_izin);
                                      setAlasanReject({});
                                    }}
                                    disabled={
                                      izinActionLoading === item.id_izin
                                    }
                                  >
                                    Tolak
                                  </button>
                                  <button
                                    className="bg-gray-500 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs"
                                    onClick={() =>
                                      handleDeleteIzin(item.id_izin)
                                    }
                                    disabled={
                                      izinActionLoading === item.id_izin
                                    }
                                  >
                                    Hapus
                                  </button>
                                </div>
                              )
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="flex-shrink-0 flex justify-start border-t px-6 py-3 bg-white sticky bottom-0 z-10"></div>
          </div>
        </div>
      )}
      <ModalHadir
        open={openHadir}
        close={handleCloseHadir}
        type={modalType}
        selectedDate={selectedDate}
        absen={absen}
      />
    </div>
  );
};

export default Presensi;
