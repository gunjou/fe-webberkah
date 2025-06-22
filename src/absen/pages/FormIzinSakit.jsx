import React, { useState, useEffect } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
//import axios from "axios";
import { IoMdClose } from "react-icons/io";
import api from "../../shared/Api";

const toTitleCase = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const FormIzinSakit = () => {
  const [date, setDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs());
  const [reason, setReason] = useState("");
  const [type, setType] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showIzinModal, setShowIzinModal] = useState(false);
  const navigate = useNavigate();
  const [izinTanggal, setIzinTanggal] = useState(dayjs());
  const [izinList, setIzinList] = useState([]);
  const [izinLoading, setIzinLoading] = useState(false);
  const [isAbsenIzinOrSakit, setIsAbsenIzinOrSakit] = useState(false);
  const [durasiIzin, setDurasiIzin] = useState("fullday"); // fullday atau halfday
  const [jamSelesai, setJamSelesai] = useState(""); // untuk setengah hari

  const jenisOptions = [
    { label: "Sakit", value: 4 },
    { label: "Izin", value: 3 },
  ];

  const fetchIzinByTanggal = async (tanggal) => {
    setIzinLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/perizinan/by-karyawan", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const targetDate = tanggal.format("DD-MM-YYYY");
      const filtered = res.data.data.filter(
        (izin) =>
          izin.tgl_mulai === targetDate || izin.tgl_selesai === targetDate
      );

      setIzinList(filtered);
    } catch (err) {
      console.error("Gagal mengambil data izin:", err);
      setIzinList([]);
    } finally {
      setIzinLoading(false);
    }
  };

  useEffect(() => {
    fetchIzinByTanggal(dayjs());
  }, []);

  const fetchDataIzin = async (tanggal) => {
    setIzinLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/perizinan/by-karyawan", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formatted = tanggal.format("YYYY-MM-DD");

      const filtered = res.data.data.filter(
        (item) => item.tgl_mulai === formatted || item.tgl_selesai === formatted
      );

      setIzinList(filtered);
    } catch (error) {
      console.error("Gagal memuat data izin:", error);
      setIzinList([]);
    } finally {
      setIzinLoading(false);
    }
  };

  useEffect(() => {
    if (showIzinModal) {
      fetchDataIzin(izinTanggal);
    }
  }, [showIzinModal, izinTanggal]);

  const handleDeleteIzin = async (id_izin) => {
    if (!window.confirm("Yakin ingin menghapus pengajuan ini?")) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/perizinan/${id_izin}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Pengajuan berhasil dihapus.");
      fetchDataIzin(izinTanggal); // refresh data
    } catch (err) {
      alert(
        "Gagal menghapus pengajuan!\n" +
          (err.response?.data?.message || "Terjadi kesalahan.")
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const token = localStorage.getItem("token");

    if (durasiIzin === "halfday") {
      if (!jamSelesai) {
        alert("Jam selesai wajib diisi!");
        setIsLoading(false);
        return;
      }

      try {
        await api.post(
          "/perizinan/setengah-hari",
          {
            jam_selesai: jamSelesai,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        alert("Pengajuan izin berhasil dikirim!");
        navigate("/absensi");
      } catch (err) {
        console.error("Error response:", err.response?.data);
        alert(
          "Gagal mengirim pengajuan izin!\n" +
            (err.response?.data?.message || "Terjadi kesalahan.")
        );
      } finally {
        setIsLoading(false);
      }

      return; // penting! agar tidak lanjut ke proses fullday di bawah
    }

    // Validasi khusus untuk fullday
    if (
      !date ||
      !endDate ||
      !type ||
      !reason.trim() ||
      (type === "4" && !attachment)
    ) {
      alert(
        type === "4"
          ? "Semua kolom wajib diisi, termasuk lampiran untuk sakit!"
          : "Semua kolom wajib diisi!"
      );
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("id_jenis", Number(type));
      formData.append("tgl_mulai", date.format("DD-MM-YYYY"));
      formData.append("tgl_selesai", endDate.format("DD-MM-YYYY"));
      formData.append("keterangan", reason);
      if (attachment) {
        formData.append("file", attachment);
      }

      await api.post("/perizinan/", formData, {
        headers: {
          "Content-Type": undefined,
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Pengajuan izin berhasil dikirim!");
      navigate("/absensi");
    } catch (err) {
      console.error("Error response:", err.response?.data);
      alert(
        "Gagal mengirim pengajuan izin!\n" +
          (err.response?.data?.message || "Terjadi kesalahan.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchStatusAbsenHariIni = async () => {
      const id_karyawan = localStorage.getItem("id_karyawan");
      const token = localStorage.getItem("token");

      try {
        const res = await api.get(`/absensi/izin-sakit`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { id_karyawan },
        });

        const data = res.data?.absensi || [];
        const today = dayjs().format("DD-MM-YYYY");

        const hasIzinOrSakit = data.some(
          (item) =>
            item.tanggal === today &&
            ["izin", "sakit"].includes(item.status_absen?.toLowerCase())
        );

        setIsAbsenIzinOrSakit(hasIzinOrSakit);
      } catch (error) {
        console.error("Gagal mengecek status absen:", error);
      }
    };

    fetchStatusAbsenHariIni();
  }, []);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-custom-merah to-custom-gelap flex items-center justify-center">
      <div className="w-full px-4 pt-4 absolute top-0 left-0 flex justify-start">
        <button
          onClick={() => navigate(-1)}
          className="text-white text-2xl hover:text-gray-300"
        >
          <FiArrowLeft />
        </button>
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-white text-black p-6 rounded-lg mt-[60px] shadow-lg w-full max-w-lg mx-4 my-4"
      >
        <h1 className="text-2xl font-bold mb-4 text-left">Form Izin/Sakit</h1>
        <p className="text-sm mb-4 text-gray-600 text-justify">
          Silakan isi form berikut dengan lengkap dan jelas untuk keperluan
          pengajuan izin atau sakit. Data yang Anda berikan akan digunakan untuk
          keperluan administrasi dan dokumentasi internal.
        </p>

        <div className="mb-4 flex justify-end">
          <button
            type="button"
            className="bg-custom-merah hover:bg-custom-gelap text-white font-semibold py-1 px-4 rounded text-sm"
            onClick={() => setShowIzinModal(true)}
          >
            Lihat History Pengajuan
          </button>
        </div>
        <div className="mb-4"></div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-left">
            Nama
          </label>
          <input
            type="text"
            value={toTitleCase(localStorage.getItem("nama"))}
            className="w-full px-3 py-2 border rounded-lg"
            readOnly
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-left">
            Durasi Izin
          </label>
          <select
            value={durasiIzin}
            onChange={(e) => setDurasiIzin(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="fullday">Full Day</option>
            <option value="halfday">Setengah Hari</option>
          </select>
        </div>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {durasiIzin === "fullday" ? (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-left">
                  Tanggal Mulai
                </label>
                <DatePicker
                  value={date}
                  onChange={(newValue) => setDate(newValue)}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      placeholder: "Pilih tanggal mulai",
                      className: "placeholder:text-xs",
                    },
                  }}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-left">
                  Tanggal Selesai
                </label>
                <DatePicker
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      placeholder: "Pilih tanggal selesai",
                      className: "placeholder:text-xs",
                    },
                  }}
                  minDate={date}
                />
              </div>
            </>
          ) : (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-left">
                Jam Selesai
              </label>
              <input
                type="time"
                value={jamSelesai}
                onChange={(e) => setJamSelesai(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
          )}
        </LocalizationProvider>
        {durasiIzin === "fullday" && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-left">
                Jenis
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="">Pilih Jenis</option>
                {jenisOptions.map((j) => (
                  <option key={j.value} value={j.value}>
                    {j.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-left">
                Alasan
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg placeholder:text-xs"
                placeholder="Masukkan alasan Anda"
                rows="4"
                required
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-left">
                Lampiran
                {type === "4" && <span className="text-red-500 ml-1">*</span>}
                <span className="text-xs text-gray-500 ml-2">
                  {type === "4"
                    ? "(Wajib untuk sakit, file gambar/pdf)"
                    : "(Opsional untuk izin, file gambar/pdf)"}
                </span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  onChange={(e) => setAttachment(e.target.files[0])}
                  className="w-full px-3 py-2 border rounded-lg"
                  accept="image/*,application/pdf"
                  required={type === "4"}
                />
                {attachment && (
                  <button
                    type="button"
                    onClick={() => setAttachment(null)}
                    className="text-red-600 font-semibold text-xs hover:underline"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {!isAbsenIzinOrSakit && (
          <button
            type="submit"
            className="w-full bg-custom-merah text-white py-2 rounded-lg hover:bg-custom-gelap disabled:opacity-50 mt-2"
            disabled={isLoading}
          >
            {isLoading ? "Mengirim..." : "Kirim"}
          </button>
        )}
        {isAbsenIzinOrSakit && (
          <p className="text-red-600 text-sm mt-2 text-center font-semibold">
            Pengajuan tidak tersedia karena status absen hari ini sudah Izin
            atau Sakit.
          </p>
        )}
      </form>

      {showIzinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white text-left text-black rounded-2xl shadow-2xl w-full max-w-3xl relative flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-white z-10">
              <h1 className="text-lg font-bold">Riwayat Pengajuan Izin</h1>
              <button
                onClick={() => setShowIzinModal(false)}
                className="text-gray-600 hover:text-black text-xl"
              >
                <IoMdClose />
              </button>
            </div>

            {/* Filter Tanggal */}
            <div className="px-6 py-3 flex items-center gap-2">
              <span className="font-semibold text-sm">Tanggal:</span>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={izinTanggal}
                  onChange={(newValue) => setIzinTanggal(newValue)}
                  format="DD-MM-YYYY"
                  slotProps={{
                    textField: {
                      size: "small",
                      className: "w-32",
                    },
                  }}
                />
              </LocalizationProvider>
            </div>

            {/* Isi Modal */}
            <div className="px-6 py-2 overflow-y-auto flex-1">
              {izinLoading ? (
                <p>Memuat data...</p>
              ) : izinList.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  Tidak ada pengajuan pada tanggal ini.
                </p>
              ) : (
                <div className="space-y-4">
                  {izinList.map((izin) => (
                    <div
                      key={izin.id_izin}
                      className="border rounded-xl p-4 bg-gray-50 shadow text-sm space-y-1 relative"
                    >
                      <div className="flex">
                        <span className="w-36 font-semibold">Nama</span>
                        <span className="mr-2">:</span>
                        <span>{izin.nama_karyawan}</span>
                      </div>
                      <div className="flex">
                        <span className="w-36 font-semibold">Jenis</span>
                        <span className="mr-2">:</span>
                        <span>{izin.nama_status}</span>
                      </div>
                      <div className="flex">
                        <span className="w-36 font-semibold">Tanggal</span>
                        <span className="mr-2">:</span>
                        <span>
                          {dayjs(izin.tgl_mulai).format("DD-MM-YYYY")} s.d.{" "}
                          {dayjs(izin.tgl_selesai).format("DD-MM-YYYY")}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="w-36 font-semibold">Alasan</span>
                        <span className="mr-2">:</span>
                        <span>{izin.keterangan}</span>
                      </div>
                      <div className="flex">
                        <span className="w-36 font-semibold">Status</span>
                        <span className="mr-2">:</span>
                        <span
                          className={
                            izin.status_izin === "approved"
                              ? "text-green-600 font-bold"
                              : izin.status_izin === "pending"
                              ? "text-yellow-600 font-bold"
                              : "text-red-600 font-bold"
                          }
                        >
                          {izin.status_izin}
                        </span>
                      </div>
                      {izin.status_izin === "rejected" && (
                        <div className="flex">
                          <span className="w-36 font-semibold">
                            Alasan Penolakan
                          </span>
                          <span className="mr-2">:</span>
                          <span>{izin.alasan_penolakan}</span>
                        </div>
                      )}
                      {izin.status_izin === "pending" && (
                        <div className="mt-2 text-right">
                          <button
                            className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded"
                            onClick={() => handleDeleteIzin(izin.id_izin)}
                          >
                            Hapus
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormIzinSakit;
