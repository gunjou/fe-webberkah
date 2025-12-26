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
import apiUpload from "../../shared/ApiUpload";

const toTitleCase = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const hitungJumlahHari = (mulai, selesai) => {
  if (!mulai || !selesai) return 0;

  const start = dayjs(mulai).startOf("day");
  const end = dayjs(selesai).startOf("day");

  return end.diff(start, "day") + 1;
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
  const [sisaCuti, setSisaCuti] = useState({
    tahun: null,
    kuota_tahunan: null,
    cuti_terpakai: null,
    sisa_kuota: null,
  });
  const [izinTanggal, setIzinTanggal] = useState(dayjs());
  const [izinList, setIzinList] = useState([]);
  const [izinLoading, setIzinLoading] = useState(false);
  const [isAbsenIzinOrSakit, setIsAbsenIzinOrSakit] = useState(false);
  const [potongCuti, setPotongCuti] = useState("0"); // "0" | "1"

  const jenisOptions = [
    { label: "Izin", value: 3 },
    { label: "Sakit", value: 4 },
    { label: "Izin Setengah Hari", value: 6 },
  ];

  const fetchDataIzin = async (tanggal) => {
    setIzinLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formattedDate = tanggal.format("YYYY-MM-DD");

      const res = await api.get("/perizinan-new/by-karyawan", {
        params: {
          tanggal: formattedDate, // SESUAI SWAGGER
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setIzinList(res.data.data || []);
    } catch (error) {
      console.error("Gagal memuat data izin:", error);
      setIzinList([]);
    } finally {
      setIzinLoading(false);
    }
  };

  const fetchSisaCuti = async () => {
    try {
      const token = localStorage.getItem("token");
      const idKaryawan = localStorage.getItem("id_karyawan");

      const res = await api.get(`/cuti/kuota-cuti/${idKaryawan}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSisaCuti(res.data.data); // Simpan semua data
    } catch (err) {
      console.error("Gagal mengambil data sisa cuti:", err);
      setSisaCuti({
        tahun: null,
        kuota_tahunan: null,
        cuti_terpakai: null,
        sisa_kuota: null,
      });
    }
  };

  useEffect(() => {
    fetchSisaCuti();
  }, []);

  useEffect(() => {
    if (showIzinModal) {
      fetchDataIzin(izinTanggal);
    }
  }, [showIzinModal, izinTanggal]);

  const handleDeleteIzin = async (id_izin) => {
    if (!window.confirm("Yakin ingin menghapus pengajuan ini?")) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/perizinan-new/delete/${id_izin}`, {
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

    if (!date || !endDate || !type || !reason.trim() || !attachment) {
      alert("Semua kolom wajib diisi, termasuk lampiran!");
      setIsLoading(false);
      return;
    }

    const jumlahHari = hitungJumlahHari(date, endDate);
    const nilaiPotongCuti = potongCuti === "1" ? jumlahHari : 0;

    try {
      const formData = new FormData();
      formData.append("id_jenis", Number(type));
      formData.append("tgl_mulai", date.format("DD-MM-YYYY"));
      formData.append("tgl_selesai", endDate.format("DD-MM-YYYY"));
      formData.append("keterangan", reason);
      formData.append("potong_cuti", nilaiPotongCuti); // INTEGER
      formData.append("file", attachment);

      // DEBUG (hapus jika sudah stabil)
      for (let [key, val] of formData.entries()) {
        console.log(key, val);
      }

      await apiUpload.post("/perizinan-new/ajukan", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Pengajuan izin berhasil dikirim!");
      navigate("/absensi");
    } catch (err) {
      console.error("ERROR:", err.response?.data);
      alert(err.response?.data?.message || "Gagal mengirim pengajuan izin");
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
            ["izin", "izin (-cuti)", "sakit"].includes(
              item.status_absen?.toLowerCase()
            )
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
      {isAbsenIzinOrSakit ? (
        <>
          <form
            onSubmit={handleSubmit}
            className="bg-white text-black p-6 rounded-lg mt-[60px] shadow-lg w-full max-w-lg mx-4 my-4"
          >
            <h1 className="text-2xl font-bold mb-4 text-left">
              Form Izin/Sakit
            </h1>
            <p className="text-sm mb-4 text-gray-600 text-justify">
              Silakan isi form berikut dengan lengkap dan jelas untuk keperluan
              pengajuan izin atau sakit. Data yang Anda berikan akan digunakan
              untuk keperluan administrasi dan dokumentasi internal.
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
                Sisa Cuti Tahun {sisaCuti?.tahun ?? "-"}
              </label>
              <input
                type="text"
                value={
                  sisaCuti?.sisa_kuota !== null &&
                  sisaCuti?.sisa_kuota !== undefined
                    ? `${sisaCuti.sisa_kuota} hari`
                    : "Memuat..."
                }
                className="w-full px-3 py-2 border rounded-lg"
                readOnly
              />
            </div>

            <span className="text-black font-semibold">
              Izin telah disetujui
            </span>
          </form>
        </>
      ) : (
        <>
          <form
            onSubmit={handleSubmit}
            className="bg-white text-black p-6 rounded-lg mt-[60px] shadow-lg w-full max-w-lg mx-4 my-4"
          >
            <h1 className="text-2xl font-bold mb-4 text-left">
              Form Izin/Sakit
            </h1>
            <p className="text-sm mb-4 text-gray-600 text-justify">
              Silakan isi form berikut dengan lengkap dan jelas untuk keperluan
              pengajuan izin atau sakit. Data yang Anda berikan akan digunakan
              untuk keperluan administrasi dan dokumentasi internal.
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
                Sisa Cuti Tahun {sisaCuti?.tahun ?? "-"}
              </label>
              <input
                type="text"
                value={
                  sisaCuti?.sisa_kuota !== null &&
                  sisaCuti?.sisa_kuota !== undefined
                    ? `${sisaCuti.sisa_kuota} hari`
                    : "Memuat..."
                }
                className="w-full px-3 py-2 border rounded-lg"
                readOnly
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
                  minDate={date}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
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
                Potong Cuti
              </label>
              <select
                value={potongCuti}
                onChange={(e) => setPotongCuti(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="0">Tidak</option>
                <option value="1">Ya</option>
              </select>

              {potongCuti === "1" && (
                <p className="text-xs text-gray-600 mt-1">
                  Cuti akan dipotong sebanyak{" "}
                  <span className="font-semibold">
                    {hitungJumlahHari(date, endDate)} hari
                  </span>
                </p>
              )}
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
                Lampiran <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">
                  (Wajib, file gambar / PDF)
                </span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  onChange={(e) => setAttachment(e.target.files[0])}
                  className="w-full px-3 py-2 border rounded-lg"
                  accept="image/*,application/pdf"
                  required
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

            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-full text-white py-2 rounded-lg mt-2 ${
                isLoading
                  ? "bg-custom-merah opacity-50 cursor-not-allowed"
                  : "bg-custom-merah hover:bg-custom-gelap"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Mengirim...
                </div>
              ) : (
                "Kirim"
              )}
            </button>
          </form>
        </>
      )}

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
                      className="border rounded-xl p-4 mb-2 bg-gray-50 shadow text-sm space-y-1 relative"
                    >
                      <div className="flex">
                        <span className="w-16 font-semibold">Nama</span>
                        <span className="mr-2">:</span>
                        <span>{izin.nama_karyawan}</span>
                      </div>
                      <div className="flex">
                        <span className="w-16 font-semibold">Jenis</span>
                        <span className="mr-2">:</span>
                        {izin.id_jenis === 3
                          ? "Izin"
                          : izin.id_jenis === 4
                          ? "Sakit"
                          : izin.id_jenis === 6
                          ? "Izin Setengah Hari"
                          : "-"}
                      </div>
                      <div className="flex">
                        <span className="w-16 font-semibold">Tanggal</span>
                        <span className="mr-2">:</span>
                        <span>
                          {dayjs(izin.tgl_mulai).format("DD-MM-YYYY")} s.d.{" "}
                          {dayjs(izin.tgl_selesai).format("DD-MM-YYYY")}
                        </span>
                      </div>
                      {izin.potong_cuti > 0 && (
                        <div className="flex">
                          <span className="w-16 font-semibold">
                            Potong Cuti
                          </span>
                          <span className="mr-2">:</span>
                          <span>{izin.potong_cuti} Hari</span>
                        </div>
                      )}

                      <div className="flex">
                        <span className="w-16 font-semibold">Alasan</span>
                        <span className="mr-2">:</span>
                        <span>{izin.keterangan}</span>
                      </div>
                      <div className="flex">
                        <span className="w-16 font-semibold">Status</span>
                        <span className="mr-2">:</span>
                        <span
                          className={
                            izin.status_izin === "approved"
                              ? "text-green-600 font-bold"
                              : izin.status_izin === "approved (-cuti)"
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
                          <span className="w-16 font-semibold">
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
