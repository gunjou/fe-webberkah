import React, { useState, useEffect } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";
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

const FormLembur = () => {
  const [date, setDate] = useState(dayjs());
  const [startTime, setStartTime] = useState(dayjs());
  const [endTime, setEndTime] = useState(null);
  const [reason, setReason] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLemburModal, setShowLemburModal] = useState(false);
  const [lemburTanggal, setLemburTanggal] = useState(dayjs());
  const [lemburList, setLemburList] = useState([]);
  const [lemburLoading, setLemburLoading] = useState(false);
  const [lemburError, setLemburError] = useState("");
  const [sudahApproved, setSudahApproved] = useState(false);
  // const [sudahMengajukan, setSudahMengajukan] = useState(false);
  const navigate = useNavigate();

  const fetchLembur = async (tanggal) => {
    setLemburLoading(true);
    setLemburError("");
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/lembur/by-karyawan", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formatted = tanggal.format("YYYY-MM-DD");
      const filtered = res.data.data.filter(
        (item) => item.tanggal === formatted
      );

      setLemburList(filtered);
    } catch (err) {
      console.error("Gagal mengambil lembur:", err);
      setLemburError("Gagal memuat data pengajuan lembur.");
      setLemburList([]);
    } finally {
      setLemburLoading(false);
    }
  };

  useEffect(() => {
    if (showLemburModal) {
      fetchLembur(lemburTanggal);
    }
  }, [showLemburModal, lemburTanggal]);

  const handleDeletePengajuan = async (id_lembur) => {
    const confirmDelete = window.confirm(
      "Yakin ingin menghapus pengajuan ini?"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/lembur/${id_lembur}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Pengajuan berhasil dihapus.");
      // Refresh data setelah hapus
      fetchLembur(lemburTanggal);
    } catch (err) {
      console.error("Gagal menghapus pengajuan:", err);
      alert(
        "Gagal menghapus pengajuan!\n" +
          (err.response?.data?.message || "Terjadi kesalahan.")
      );
    }
  };

  const cekPengajuanApproved = async (tanggal) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/lembur/by-karyawan", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formatted = tanggal.format("YYYY-MM-DD");
      const lemburHariIni = res.data.data.filter(
        (item) => item.tanggal === formatted
      );

      const adaApproved = lemburHariIni.some(
        (item) => item.status_lembur?.toLowerCase() === "approved"
      );

      setSudahApproved(adaApproved);
    } catch (err) {
      console.error("Gagal cek pengajuan approved:", err);
      setSudahApproved(false); // fallback: tetap bisa kirim kalau error
    }
  };
  useEffect(() => {
    cekPengajuanApproved(date);
  }, [date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!date || !startTime || !endTime) {
      alert("Semua kolom wajib diisi!");
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("tanggal", date.format("DD-MM-YYYY"));
      formData.append("jam_mulai", startTime.format("HH:mm"));
      formData.append("jam_selesai", endTime.format("HH:mm"));
      formData.append("keterangan", reason);
      if (attachment) {
        formData.append("file", attachment);
      }

      const token = localStorage.getItem("token");
      await api.post(`/lembur/pengajuan`, formData, {
        headers: {
          "Content-Type": undefined,
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Pengajuan lembur berhasil dikirim!");
      navigate("/absensi");
    } catch (err) {
      console.error("Error response:", err.response?.data);
      alert(
        "Gagal mengirim pengajuan lembur!\n" +
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
        <h1 className="text-2xl font-bold mb-4 text-left">Form Lembur</h1>
        <p className="text-sm mb-4 text-gray-600 text-justify">
          Silakan isi form berikut dengan lengkap dan jelas untuk keperluan
          pengajuan lembur. Data yang Anda berikan akan digunakan untuk
          keperluan administrasi dan dokumentasi internal.
        </p>

        <div className="mb-4 flex justify-end">
          <button
            type="button"
            className="bg-custom-merah hover:bg-custom-gelap text-white font-semibold py-1 px-4 rounded text-sm"
            onClick={() => setShowLemburModal(true)}
          >
            Lihat History Pengajuan
          </button>
        </div>
        <div className="mb-4"></div>
        {/* {sudahMengajukan && (
          <div className="mb-4 text-left text-xs text-red-600 font-semibold">
            Anda sudah mengajukan lembur untuk tanggal ini. Form tidak dapat
            diisi lagi hari ini.
          </div>
        )} */}
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
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-left">
              Tanggal
            </label>
            <DatePicker
              value={date}
              onChange={(newValue) => setDate(newValue)}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  placeholder: "Pilih tanggal",
                },
              }}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-left">
              Waktu Mulai
            </label>
            <TimePicker
              value={startTime}
              onChange={(newValue) => setStartTime(newValue)}
              ampm={false}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  placeholder: "Pilih waktu mulai",
                },
              }}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-left">
              Waktu Selesai
            </label>
            <TimePicker
              value={endTime}
              onChange={(newValue) => setEndTime(newValue)}
              ampm={false}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  placeholder: "Pilih waktu selesai",
                  className: "placeholder:text-xs",
                },
              }}
            />
          </div>
        </LocalizationProvider>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-left">
            Alasan Lembur
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg placeholder:text-xs"
            placeholder="Masukkan alasan lembur Anda"
            rows="4"
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-left">
            Lampiran
            <span className="text-xs text-gray-500 ml-2">
              (Opsional, file gambar/pdf)
            </span>
          </label>
          <input
            type="file"
            onChange={(e) => setAttachment(e.target.files[0])}
            className="w-full px-3 py-2 border rounded-lg"
            accept="image/*,application/pdf"
          />
        </div>
        {sudahApproved && (
          <p className="text-red-600 text-sm font-semibold mb-2">
            Anda sudah mengajukan lembur dan disetujui untuk tanggal ini.
          </p>
        )}

        {!sudahApproved && (
          <button
            type="submit"
            className="w-full bg-custom-merah text-white py-2 rounded-lg hover:bg-custom-gelap"
            disabled={isLoading}
          >
            {isLoading ? "Mengirim..." : "Kirim"}
          </button>
        )}
      </form>
      {showLemburModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white text-black rounded-lg shadow-lg w-full max-w-2xl mx-4 relative flex flex-col max-h-[90vh]">
            <div className="flex-shrink-0 flex items-center justify-between border-b px-6 py-4 bg-white sticky top-0 z-10">
              <h1 className="text-xl font-bold text-left">
                Data Pengajuan Lembur
              </h1>
              <button
                onClick={() => setShowLemburModal(false)}
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
                  value={lemburTanggal}
                  onChange={(newValue) => setLemburTanggal(newValue)}
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
              {lemburLoading ? (
                <div className="flex justify-center py-8">
                  <span>Memuat data...</span>
                </div>
              ) : lemburError ? (
                <div className="text-red-500 text-center">{lemburError}</div>
              ) : lemburList.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  Tidak ada pengajuan lembur pada tanggal ini.
                </div>
              ) : (
                <div className="space-y-4">
                  {lemburList.map((item, idx) => {
                    // Format tanggal
                    let tanggal = "";
                    if (
                      item.tanggal &&
                      dayjs(item.tanggal, "YYYY-MM-DD").isValid()
                    ) {
                      tanggal = dayjs(item.tanggal, "YYYY-MM-DD").format(
                        "DD/MM/YYYY"
                      );
                    } else if (item.tanggal) {
                      tanggal = item.tanggal;
                    }

                    // Jam mulai & selesai
                    const jamMulai = item.jam_mulai || "-";
                    const jamSelesai = item.jam_selesai || "-";

                    return (
                      <div
                        key={item.id_lembur || item.id || idx}
                        className="border rounded-lg p-4 bg-gray-50 shadow-sm text-left"
                      >
                        <div className="mb-1 flex">
                          <span className="font-semibold w-36 inline-block">
                            Nama
                          </span>
                          <span className="mr-2">:</span>
                          <span>
                            {item.nama_karyawan
                              ? item.nama_karyawan.replace(/\b\w/g, (c) =>
                                  c.toUpperCase()
                                )
                              : ""}
                          </span>
                        </div>
                        <div className="mb-1 flex">
                          <span className="font-semibold w-36 inline-block">
                            Tanggal
                          </span>
                          <span className="mr-2">:</span>
                          <span>{tanggal}</span>
                        </div>
                        <div className="mb-1 flex">
                          <span className="font-semibold w-36 inline-block">
                            Jam Mulai
                          </span>
                          <span className="mr-2">:</span>
                          <span>{jamMulai?.slice(0, 5)}</span>
                        </div>
                        <div className="mb-1 flex">
                          <span className="font-semibold w-36 inline-block">
                            Jam Selesai
                          </span>
                          <span className="mr-2">:</span>
                          <span>{jamSelesai?.slice(0, 5)}</span>
                        </div>
                        <div className="mb-1 flex">
                          <span className="font-semibold w-36 inline-block">
                            Deskripsi
                          </span>
                          <span className="mr-2">:</span>
                          <span>
                            {item.deskripsi || item.keterangan || "-"}
                          </span>
                        </div>
                        <div className="mb-1 flex">
                          <span className="font-semibold w-36 inline-block">
                            Status
                          </span>
                          <span className="mr-2">:</span>
                          <span
                            className={
                              item.status_lembur?.toLowerCase() === "approved"
                                ? "font-bold text-green-600"
                                : item.status_lembur?.toLowerCase() ===
                                  "pending"
                                ? "font-bold text-yellow-500"
                                : item.status_lembur?.toLowerCase() ===
                                  "rejected"
                                ? "font-bold text-red-600"
                                : "font-bold text-gray-600"
                            }
                          >
                            {item.status_lembur
                              ? item.status_lembur.replace(/\b\w/g, (c) =>
                                  c.toUpperCase()
                                )
                              : ""}
                          </span>
                        </div>
                        {item.lampiran && (
                          <div className="mb-1 flex">
                            <span className="font-semibold w-36 inline-block">
                              Lampiran
                            </span>
                            <span className="mr-2">:</span>
                            <a
                              href={item.lampiran}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline break-all"
                            >
                              Lihat Lampiran
                            </a>
                          </div>
                        )}
                        <div className="flex justify-end mt-2">
                          {item.status_lembur?.toLowerCase() !== "approved" && (
                            <div className="flex justify-end mt-2">
                              <button
                                className="bg-red-500 hover:bg-red-700 text-white text-xs px-3 py-1 rounded"
                                onClick={() =>
                                  handleDeletePengajuan(
                                    item.id_lembur || item.id
                                  )
                                }
                                type="button"
                              >
                                Hapus Pengajuan
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex-shrink-0 flex justify-start border-t px-6 py-3 bg-white sticky bottom-0 z-10">
              <button
                onClick={() => setShowLemburModal(false)}
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

export default FormLembur;
