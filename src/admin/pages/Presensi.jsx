import { React, useState, useEffect } from "react";
import { Card } from "flowbite-react";
import { PiOfficeChairBold } from "react-icons/pi";
import { FaHelmetSafety } from "react-icons/fa6";
import { MdCleaningServices } from "react-icons/md";
import { ImCross } from "react-icons/im";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { IoMdNotificationsOutline } from "react-icons/io";
import Badge from "@mui/material/Badge";
import { IoMdClose } from "react-icons/io";

import api from "../../shared/Api";

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
  const [izinActionLoading, setIzinActionLoading] = useState(null);
  const [rejectId, setRejectId] = useState(null);
  const [alasanReject, setAlasanReject] = useState("");

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
      .get("/karyawan")
      .then((res) => {
        const sorted = res.data.karyawan
          .filter((item) => item.nama)
          .sort((a, b) => a.nama.localeCompare(b.nama));

        setKaryawan(sorted);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
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

  const fetchIzinList = async (tgl = null) => {
    setIzinLoading(true);
    setIzinError("");
    try {
      const token = localStorage.getItem("token");
      let url = `/izin/list`;
      if (tgl) {
        url += `?tanggal=${dayjs(tgl).format("YYYY-MM-DD")}`;
      }
      const res = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let data = res.data.data;
      if (!data) setIzinList([]);
      else if (Array.isArray(data)) setIzinList(data);
      else setIzinList([data]);
    } catch (err) {
      setIzinError("Gagal memuat data pengajuan izin.");
      setIzinList([]);
    } finally {
      setIzinLoading(false);
    }
  };

  useEffect(() => {
    if (izinModal) fetchIzinList(izinFilterTanggal);
  }, [izinModal, izinFilterTanggal]);

  const handleApproveIzin = async (id_izin) => {
    if (!window.confirm("Setujui pengajuan izin ini?")) return;
    setIzinActionLoading(id_izin);
    try {
      const token = localStorage.getItem("token");
      await api.post(
        `/izin/${id_izin}/approve`,
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

  const handleRejectIzin = async (id_izin) => {
    if (!alasanReject.trim()) {
      alert("Alasan penolakan wajib diisi!");
      return;
    }
    setIzinActionLoading(id_izin);
    try {
      const token = localStorage.getItem("token");
      await api.post(
        `/izin/${id_izin}/reject`,
        { alasan_penolakan: alasanReject },
        {
          headers: {
            "Content-Type": undefined,
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRejectId(null);
      setAlasanReject("");
      fetchIzinList(izinFilterTanggal);
    } catch (err) {
      alert("Gagal reject izin!");
    } finally {
      setIzinActionLoading(null);
    }
  };

  const openNotifModal = () => {
    setNotifModal(true);
    fetchNotifCount();
  };

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
              className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white text-sm font-semibold px-4 py-2 rounded shadow"
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
                    {absen.length}/{karyawan.length}
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
                      {
                        absen.filter(
                          (item) =>
                            item.nama_status === "Izin" ||
                            item.nama_status === "Sakit"
                        ).length
                      }
                      /{karyawan.length}
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
                      {karyawan.length - absen.length}/
                      {karyawan.filter((item) => item.id_karyawan).length}
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
                    {absen.filter((item) => item.id_jenis === 5).length}/
                    {karyawan.filter((item) => item.id_jenis === 5).length}
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
                    Cleaning Services
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
                  <MdCleaningServices className="h-6 w-6" />
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
                        <span>{item.nama || "-"}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white text-black rounded-lg shadow-lg w-full max-w-4xl mx-4 relative flex flex-col max-h-[90vh]">
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
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Filter Tanggal"
                  value={izinFilterTanggal}
                  onChange={setIzinFilterTanggal}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      size: "small",
                      className: "w-30",
                      placeholder: "Pilih tanggal",
                    },
                  }}
                  clearable
                />
              </LocalizationProvider>
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
                <div className="overflow-x-auto">
                  <table className="min-w-full border text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border px-2 py-1">Nama</th>
                        <th className="border px-2 py-1">Jenis</th>
                        <th className="border px-2 py-1">Tanggal Mulai</th>
                        <th className="border px-2 py-1">Tanggal Selesai</th>
                        <th className="border px-2 py-1">Durasi Izin</th>{" "}
                        {/* Tambahan kolom durasi */}
                        <th className="border px-2 py-1">Keterangan</th>
                        <th className="border px-2 py-1">Lampiran</th>
                        <th className="border px-2 py-1">Status</th>
                        <th className="border px-2 py-1">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {izinList.map((item) => (
                        <tr key={item.id_izin}>
                          <td className="border px-2 py-1">
                            {item.nama
                              ? item.nama.replace(/\b\w/g, (c) =>
                                  c.toUpperCase()
                                )
                              : "-"}
                          </td>
                          <td className="border px-2 py-1">
                            {item.nama_status || "-"}
                          </td>
                          <td className="border px-2 py-1">
                            {item.tgl_mulai
                              ? dayjs(item.tgl_mulai).format("DD/MM/YYYY")
                              : "-"}
                          </td>
                          <td className="border px-2 py-1">
                            {item.tgl_selesai
                              ? dayjs(item.tgl_selesai).format("DD/MM/YYYY")
                              : "-"}
                          </td>
                          <td className="border px-2 py-1">
                            {item.durasi_izin
                              ? `${item.durasi_izin} hari`
                              : "-"}
                          </td>
                          <td className="border px-2 py-1">
                            {item.keterangan || "-"}
                          </td>
                          <td className="border px-2 py-1">
                            {item.path_lampiran ? (
                              <a
                                href={item.path_lampiran}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                                title="Lihat lampiran"
                              >
                                Lihat
                              </a>
                            ) : (
                              <span>-</span>
                            )}
                          </td>
                          <td className="border px-2 py-1 font-semibold">
                            <span
                              className={
                                item.status_izin === "approved"
                                  ? "text-green-600"
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
                                    value={alasanReject}
                                    onChange={(e) =>
                                      setAlasanReject(e.target.value)
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
                                        setAlasanReject("");
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
                                    className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                                    onClick={() => {
                                      setRejectId(item.id_izin);
                                      setAlasanReject("");
                                    }}
                                    disabled={
                                      izinActionLoading === item.id_izin
                                    }
                                  >
                                    Tolak
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
            <div className="flex-shrink-0 flex justify-start border-t px-6 py-3 bg-white sticky bottom-0 z-10">
              <button
                onClick={() => setIzinModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      <ModalHadir
        open={openHadir}
        close={handleCloseHadir}
        type={modalType}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default Presensi;
