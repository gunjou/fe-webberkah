import React, { useState, useEffect } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import axios from "axios";
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
  const [izinTanggal, setIzinTanggal] = useState(dayjs());
  const [izinList, setIzinList] = useState([]);
  const [izinLoading, setIzinLoading] = useState(false);
  const [izinError, setIzinError] = useState("");
  const [sudahMengajukan, setSudahMengajukan] = useState(false);
  const navigate = useNavigate();

  const jenisOptions = [
    { label: "Sakit", value: 4 },
    { label: "Izin", value: 3 },
  ];

  const fetchIzin = async (tanggal) => {
    setIzinLoading(true);
    setIzinError("");
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/check-izin?tanggal=${tanggal}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data;
      setIzinList(Array.isArray(data) ? data : data ? [data] : []);
    } catch (err) {
      setIzinError("Gagal memuat data pengajuan izin.");
      setIzinList([]);
    } finally {
      setIzinLoading(false);
    }
  };

  const handleDeletePengajuan = async (id_izin) => {
    if (!window.confirm("Yakin ingin menghapus pengajuan ini?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/hapus-pengajuan/${id_izin}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Pengajuan berhasil dihapus.");
      // Refresh data setelah hapus
      fetchIzin(izinTanggal.format("YYYY-MM-DD"));
      // Jika tanggal utama sama dengan tanggal modal, refresh status disable form
      if (date.format("YYYY-MM-DD") === izinTanggal.format("YYYY-MM-DD")) {
        // Cek ulang status pengajuan hari ini
        const res = await api.get(
          `/check-izin?tanggal=${date.format("YYYY-MM-DD")}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = res.data.data;
        setSudahMengajukan(Array.isArray(data) ? data.length > 0 : !!data);
      }
    } catch (err) {
      alert(
        "Gagal menghapus pengajuan!\n" +
          (err.response?.data?.message || "Terjadi kesalahan.")
      );
    }
  };

  useEffect(() => {
    if (showIzinModal) {
      fetchIzin(izinTanggal.format("YYYY-MM-DD"));
    }
  }, [showIzinModal, izinTanggal]);

  useEffect(() => {
    const cekPengajuanHariIni = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(
          `/check-izin?tanggal=${date.format("YYYY-MM-DD")}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // Jika ada data pengajuan pada tanggal tersebut, set disable
        const data = res.data.data;
        setSudahMengajukan(Array.isArray(data) ? data.length > 0 : !!data);
      } catch (err) {
        setSudahMengajukan(false); // Jika error, tetap bisa isi
      }
    };
    cekPengajuanHariIni();
  }, [date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

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

      const token = localStorage.getItem("token");
      await api.post(`/perizinan/`, formData, {
        headers: {
          "Content-Type": undefined,
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Pengajuan izin berhasil dikirim!");
      window.location.reload();
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
        {sudahMengajukan && (
          <div className="mb-4 text-left text-xs text-red-600 font-semibold">
            Anda sudah mengajukan izin/sakit untuk tanggal ini. Form tidak dapat
            diisi lagi hari ini.
          </div>
        )}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-left">
            Nama
          </label>
          <input
            type="text"
            value={toTitleCase(localStorage.getItem("nama"))}
            className="w-full px-3 py-2 border rounded-lg"
            readOnly
            disabled={sudahMengajukan}
          />
        </div>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
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
                  disabled: sudahMengajukan,
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
                  disabled: sudahMengajukan,
                },
              }}
              minDate={date}
            />
          </div>
        </LocalizationProvider>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-left">
            Jenis
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
            disabled={sudahMengajukan}
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
            disabled={sudahMengajukan}
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
          <input
            type="file"
            onChange={(e) => setAttachment(e.target.files[0])}
            className="w-full px-3 py-2 border rounded-lg"
            accept="image/*,application/pdf"
            required={type === "4"}
            disabled={sudahMengajukan}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-custom-merah text-white py-2 rounded-lg hover:bg-custom-gelap"
          disabled={isLoading || sudahMengajukan}
        >
          {isLoading ? "Mengirim..." : "Kirim"}
        </button>
      </form>
      {showIzinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white text-black rounded-lg shadow-lg w-full max-w-2xl mx-4 relative flex flex-col max-h-[90vh]">
            <div className="flex-shrink-0 flex items-center justify-between border-b px-6 py-4 bg-white sticky top-0 z-10">
              <h1 className="text-xl font-bold text-left">
                Data Pengajuan Izin atau Sakit
              </h1>
              <button
                onClick={() => setShowIzinModal(false)}
                className="text-gray-500 hover:text-black text-xl"
                aria-label="Tutup"
              >
                <IoMdClose size={25} />
              </button>
            </div>
            <div className="px-6 pt-4 pb-2 flex items-center gap-2">
              <span className="font-semibold">Tanggal:</span>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={izinTanggal}
                  onChange={(newValue) => setIzinTanggal(newValue)}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      size: "small",
                      className: "w-30",
                    },
                  }}
                />
              </LocalizationProvider>
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
                  Tidak ada pengajuan izin/sakit pada tanggal ini.
                </div>
              ) : (
                <div className="space-y-4">
                  {izinList.map((item, idx) => {
                    // Tampilkan tanggal asli jika tidak valid, jangan tampilkan "-"
                    let tglMulai = "";
                    if (
                      item.tgl_mulai &&
                      dayjs(item.tgl_mulai, "YYYY-MM-DD").isValid()
                    ) {
                      tglMulai = dayjs(item.tgl_mulai, "YYYY-MM-DD").format(
                        "DD/MM/YYYY"
                      );
                    } else if (item.tgl_mulai) {
                      tglMulai = item.tgl_mulai;
                    }

                    let tglSelesai = "";
                    if (
                      item.tgl_selesai &&
                      dayjs(item.tgl_selesai, "YYYY-MM-DD").isValid()
                    ) {
                      tglSelesai = dayjs(item.tgl_selesai, "YYYY-MM-DD").format(
                        "DD/MM/YYYY"
                      );
                    } else if (item.tgl_selesai) {
                      tglSelesai = item.tgl_selesai;
                    }

                    const durasiIzin =
                      typeof item.durasi_izin === "number" &&
                      item.durasi_izin > 0
                        ? `${item.durasi_izin} hari`
                        : item.durasi_izin
                        ? `${item.durasi_izin} hari`
                        : "";

                    return (
                      <div
                        key={item.id || idx}
                        className="border rounded-lg p-4 bg-gray-50 shadow-sm text-left"
                      >
                        <div className="mb-1 flex">
                          <span className="font-semibold w-36 inline-block">
                            Nama
                          </span>
                          <span className="mr-2">:</span>
                          <span>
                            {item.nama
                              ? item.nama.replace(/\b\w/g, (c) =>
                                  c.toUpperCase()
                                )
                              : ""}
                          </span>
                        </div>
                        <div className="mb-1 flex">
                          <span className="font-semibold w-36 inline-block">
                            Jenis
                          </span>
                          <span className="mr-2">:</span>
                          <span>{item.nama_status}</span>
                        </div>
                        <div className="mb-1 flex">
                          <span className="font-semibold w-36 inline-block">
                            Tanggal Mulai
                          </span>
                          <span className="mr-2">:</span>
                          <span>{tglMulai}</span>
                        </div>
                        <div className="mb-1 flex">
                          <span className="font-semibold w-36 inline-block">
                            Tanggal Selesai
                          </span>
                          <span className="mr-2">:</span>
                          <span>{tglSelesai}</span>
                        </div>
                        <div className="mb-1 flex">
                          <span className="font-semibold w-36 inline-block">
                            Durasi Izin
                          </span>
                          <span className="mr-2">:</span>
                          <span>{durasiIzin}</span>
                        </div>
                        <div className="mb-1 flex">
                          <span className="font-semibold w-36 inline-block">
                            Alasan
                          </span>
                          <span className="mr-2">:</span>
                          <span>{item.keterangan}</span>
                        </div>
                        <div className="mb-1 flex">
                          <span className="font-semibold w-36 inline-block">
                            Status
                          </span>
                          <span className="mr-2">:</span>
                          <span
                            className={
                              item.status_izin?.toLowerCase() === "approved"
                                ? "font-bold text-green-600"
                                : item.status_izin?.toLowerCase() === "pending"
                                ? "font-bold text-yellow-500"
                                : item.status_izin?.toLowerCase() === "rejected"
                                ? "font-bold text-red-600"
                                : "font-bold text-gray-600"
                            }
                          >
                            {item.status_izin
                              ? item.status_izin.replace(/\b\w/g, (c) =>
                                  c.toUpperCase()
                                )
                              : ""}
                          </span>
                        </div>
                        <div className="flex justify-end mt-2">
                          <button
                            className="bg-red-500 hover:bg-red-700 text-white text-xs px-3 py-1 rounded"
                            onClick={() =>
                              handleDeletePengajuan(item.id_izin || item.id)
                            }
                            type="button"
                          >
                            Hapus Pengajuan
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex-shrink-0 flex justify-start border-t px-6 py-3 bg-white sticky bottom-0 z-10">
              <button
                onClick={() => setShowIzinModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormIzinSakit;
