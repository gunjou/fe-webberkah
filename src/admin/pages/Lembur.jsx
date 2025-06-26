import React, { useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import api from "../../shared/Api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";

const Lembur = () => {
  const [fileBlobs, setFileBlobs] = useState({});
  const [tanggal, setTanggal] = useState(null);
  const [lemburList, setLemburList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lemburModal, setLemburModal] = useState(false);
  const [lemburActionLoading, setLemburActionLoading] = useState(null);
  const [lemburRejectId, setLemburRejectId] = useState(null);
  const [lemburAlasanReject, setLemburAlasanReject] = useState({});
  const [idKaryawanFilter, setIdKaryawanFilter] = useState("");
  const [statusLemburFilter, setStatusLemburFilter] = useState("");
  const [pegawaiList, setPegawaiList] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formData, setFormData] = useState({
    id_karyawan: "",
    tanggal: "",
    jam_mulai: "",
    jam_selesai: "",
    keterangan: "",
    file: "",
  });

  // Function to fetch lembur data
  const fetchLembur = useCallback(
    async (tgl) => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/lembur/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        let data = res.data.data;
        const list = Array.isArray(data) ? data : data ? [data] : [];

        // Filter by Tanggal
        let filteredList = tgl
          ? list.filter(
              (item) =>
                item.tanggal &&
                dayjs(item.tanggal).format("YYYY-MM-DD") ===
                  dayjs(tgl).format("YYYY-MM-DD")
            )
          : list;

        // Filter by ID Karyawan
        if (idKaryawanFilter) {
          filteredList = filteredList.filter(
            (item) => item.id_karyawan === parseInt(idKaryawanFilter)
          );
        }

        // Filter by Status Lembur
        if (statusLemburFilter) {
          filteredList = filteredList.filter(
            (item) => item.status_lembur === statusLemburFilter
          );
        }

        setLemburList(filteredList);

        // Ambil daftar id_karyawan dan nama_karyawan yang unik untuk dropdown
        const pegawaiList = filteredList.reduce((acc, item) => {
          // Memastikan hanya nama_karyawan yang unik yang ditambahkan
          if (
            !acc.some((pegawai) => pegawai.id_karyawan === item.id_karyawan)
          ) {
            acc.push({
              id_karyawan: item.id_karyawan,
              nama_karyawan: item.nama_karyawan,
            });
          }
          return acc;
        }, []);

        setPegawaiList(pegawaiList);
      } catch {
        setLemburList([]);
      } finally {
        setLoading(false);
      }
    },
    [tanggal, idKaryawanFilter, statusLemburFilter]
  );

  const fetchPegawaiList = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/pegawai/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("DATA PEGAWAI:", res.data); // 👈 log hasil

      setPegawaiList(res.data);
    } catch (error) {
      console.error("Gagal ambil data pegawai:", error);
    }
  };

  useEffect(() => {
    fetchLembur(tanggal);
    fetchPegawaiList(); // <- penting!
  }, [tanggal, idKaryawanFilter, statusLemburFilter, fetchLembur]);

  // Excel download functionality
  const downloadExcel = () => {
    const header = [
      "No",
      "Nama",
      "Tanggal",
      "Jam Mulai",
      "Jam Selesai",
      "Deskripsi",
      "Lampiran",
      "Status",
    ];
    const rows = lemburList.map((item, idx) => [
      idx + 1,
      item.nama_karyawan || "-",
      item.tanggal,
      item.jam_mulai,
      item.jam_selesai,
      item.keterangan || "-",
      item.path_lampiran || "-",
      item.status_lembur,
    ]);
    const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Lembur");
    XLSX.writeFile(workbook, "Data_Lembur.xlsx");
  };

  // PDF download functionality
  const downloadPDF = () => {
    const doc = new jsPDF("landscape");
    doc.setFontSize(14);
    doc.text("Data Lembur Pegawai", 14, 15);
    const tableHead = [
      "No",
      "Nama",
      "Tanggal",
      "Jam Mulai",
      "Jam Selesai",
      "Deskripsi",
      "Lampiran",
      "Status",
    ];
    const tableBody = lemburList.map((item, idx) => [
      idx + 1,
      item.nama_karyawan || "-",
      item.tanggal,
      item.jam_mulai,
      item.jam_selesai,
      item.keterangan || "-",
      item.path_lampiran || "-",
      item.status_lembur,
    ]);
    doc.autoTable({
      head: [tableHead],
      body: tableBody,
      startY: 25,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255] },
    });
    doc.save("Data_Lembur.pdf");
  };

  // Handle actions like approve, reject, and delete
  const handleApprove = async (id_lembur) => {
    if (!window.confirm("Setujui lembur ini?")) return;
    setLemburActionLoading(id_lembur);
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/lembur/${id_lembur}/setujui`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchLembur(tanggal);
      setLemburModal(false);
    } catch {
      alert("Gagal menyetujui lembur.");
    } finally {
      setLemburActionLoading(null);
    }
  };

  const handleReject = async (id_lembur) => {
    if (!window.confirm("Tolak lembur ini?")) return;
    setLemburActionLoading(id_lembur);
    // No need for reason validation anymore
    setLemburActionLoading(id_lembur);
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/lembur/${id_lembur}/tolak`,
        {}, // No reason required
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLemburRejectId(null);
      setLemburAlasanReject({});
      fetchLembur(tanggal);
    } catch {
      alert("Gagal menolak lembur.");
    } finally {
      setLemburActionLoading(null);
    }
  };

  const handleDelete = async (id_lembur) => {
    if (!window.confirm("Yakin ingin menghapus lembur ini?")) return;
    setLemburActionLoading(id_lembur);
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/lembur/${id_lembur}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLembur(tanggal);
      alert("Lembur berhasil dihapus.");
    } catch {
      alert("Gagal menghapus lembur.");
    } finally {
      setLemburActionLoading(null);
    }
  };

  const fetchFileWithToken = async (path, id_lembur) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://api.berkahangsana.com/lembur/preview/${path}`, // URL ini sesuaikan dengan endpoint preview lembur
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Gagal ambil file.");

      const blob = await res.blob();
      const objectURL = URL.createObjectURL(blob);
      setFileBlobs((prev) => ({ ...prev, [id_lembur]: objectURL }));
      window.open(objectURL, "_blank");
    } catch (err) {
      console.error("Gagal ambil file preview:", err);
      alert("Gagal membuka lampiran.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">Lembur</h2>
      {/* Table for Lembur Data */}
      <div className="bg-white shadow rounded-lg px-6 pb-2">
        <div className="flex items-center gap-4 mb-2 pt-4">
          {/* Filter Tanggal */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Pilih Tanggal"
              value={tanggal}
              onChange={setTanggal}
              format="DD/MM/YYYY"
              className="bg-white rounded-lg"
              slotProps={{
                textField: {
                  size: "small",
                  sx: { minWidth: 120 },
                },
              }}
            />
          </LocalizationProvider>

          {/* Filter Pegawai */}
          <select
            value={idKaryawanFilter}
            onChange={(e) => setIdKaryawanFilter(e.target.value)}
            className="px-2 py-2 border rounded-lg text-sm"
          >
            <option value="">Pilih Pegawai</option>
            {pegawaiList.map((pegawai) => (
              <option key={pegawai.id_karyawan} value={pegawai.id_karyawan}>
                {pegawai.nama_karyawan}
              </option>
            ))}
          </select>

          {/* Filter Status Lembur */}
          <select
            value={statusLemburFilter}
            onChange={(e) => setStatusLemburFilter(e.target.value)}
            className="px-2 py-2 border rounded-lg text-sm"
          >
            <option value="">Pilih Status Lembur</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Lain-lain */}
          <button
            className="bg-red-800 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
            onClick={() => {
              setLemburModal(true);
              fetchLembur(tanggal); // Fetch lembur with the current filters applied
            }}
          >
            Pengajuan Lembur
          </button>

          {/* Download Buttons */}
          <div className="flex gap-2 ml-auto">
            <button
              className="flex items-center text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg"
              onClick={downloadExcel}
            >
              <FaFileExcel className="mr-2" /> Excel
            </button>
            <button
              className="flex items-center text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg"
              onClick={downloadPDF}
            >
              <FaFilePdf className="mr-2" /> PDF
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <div className="max-h-80 overflow-y-auto">
            <table className="min-w-full text-sm border">
              <thead className="bg-gray-100 sticky -top-1 z-10">
                <tr>
                  <th className="border px-2 py-1">No</th>
                  <th className="border px-2 py-1">Nama</th>
                  <th className="border px-2 py-1">Tanggal</th>
                  <th className="border px-2 py-1">Jam Mulai</th>
                  <th className="border px-2 py-1">Jam Selesai</th>
                  <th className="border px-2 py-1">Deskripsi</th>
                  <th className="border px-2 py-1">Lampiran</th>
                  <th className="border px-2 py-1">Status</th>
                </tr>
              </thead>
              <tbody>
                {lemburList.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-gray-500">
                      Tidak ada data lembur.
                    </td>
                  </tr>
                ) : (
                  lemburList.map((item, index) => (
                    <tr key={item.id_lembur}>
                      <td className="border px-2 py-1 text-center">
                        {index + 1}
                      </td>
                      <td className="border px-2 py-1 capitalize">
                        {item.nama_karyawan}
                      </td>
                      <td className="border px-2 py-1">{item.tanggal}</td>
                      <td className="border px-2 py-1">
                        {item.jam_mulai?.slice(0, 5)}
                      </td>
                      <td className="border px-2 py-1">
                        {item.jam_selesai?.slice(0, 5)}
                      </td>
                      <td className="border px-2 py-1">{item.keterangan}</td>
                      <td className="border px-2 py-1 text-center">
                        {item.path_lampiran ? (
                          <button
                            onClick={() =>
                              fetchFileWithToken(
                                item.path_lampiran,
                                item.id_lembur
                              )
                            }
                            className="text-blue-600 hover:underline text-xs"
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
                            item.status_lembur === "approved"
                              ? "text-green-600"
                              : item.status_lembur === "pending"
                              ? "text-yellow-600"
                              : item.status_lembur === "rejected"
                              ? "text-red-600"
                              : ""
                          }
                        >
                          {item.status_lembur
                            ? item.status_lembur.charAt(0).toUpperCase() +
                              item.status_lembur.slice(1)
                            : "-"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <button
          className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 mt-2 rounded-lg text-sm"
          onClick={() => {
            fetchPegawaiList(); // <- langsung panggil sebelum form muncul
            setShowFormModal(true);
          }}
        >
          Tambah Lembur
        </button>
      </div>
      {showFormModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
          onClick={() => setShowFormModal(false)}
        >
          <div
            className="bg-white rounded-lg w-full max-w-lg p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">Form Tambah Lembur</h2>
            <form
              className="flex flex-col gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                const token = localStorage.getItem("token");
                const form = new FormData();
                const formattedDate = dayjs(formData.tanggal).format(
                  "DD-MM-YYYY"
                );

                form.append("id_karyawan", formData.id_karyawan);
                form.append("tanggal", formattedDate);
                form.append("jam_mulai", formData.jam_mulai);
                form.append("jam_selesai", formData.jam_selesai);
                form.append("keterangan", formData.keterangan);
                if (formData.file) {
                  form.append("file", formData.file);
                }

                try {
                  await api.post("/lembur/pengajuan", form, {
                    headers: {
                      "Content-Type": "multipart/form-data",
                      Authorization: `Bearer ${token}`,
                    },
                  });

                  alert("Lembur berhasil ditambahkan!");
                  fetchLembur(tanggal);
                  setShowFormModal(false);
                  setFormData({
                    id_karyawan: "",
                    tanggal: "",
                    jam_mulai: "",
                    jam_selesai: "",
                    keterangan: "",
                    file: "",
                  });
                } catch {
                  alert("Gagal menambahkan lembur.");
                }
              }}
            >
              {/* ID Karyawan */}
              <div>
                <label className="block font-medium">Pilih Pegawai</label>
                <select
                  required
                  value={formData.id_karyawan}
                  onChange={(e) =>
                    setFormData({ ...formData, id_karyawan: e.target.value })
                  }
                  className="border p-1 capitalize rounded w-full"
                >
                  <option value="">Pilih Pegawai</option>
                  {pegawaiList.map((p) => (
                    <option key={p.id_karyawan} value={p.id_karyawan}>
                      {p.nama}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tanggal */}
              <div>
                <label className="block  font-medium">Tanggal Lembur</label>
                <input
                  required
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) =>
                    setFormData({ ...formData, tanggal: e.target.value })
                  }
                  className="border p-1 rounded w-full"
                />
              </div>

              {/* Jam Mulai */}
              <div>
                <label className="block font-medium">Jam Mulai</label>
                <input
                  required
                  //type="time"
                  value={formData.jam_mulai}
                  placeholder="HH:MM"
                  onChange={(e) =>
                    setFormData({ ...formData, jam_mulai: e.target.value })
                  }
                  className="border border-black p-1 rounded w-full"
                />
              </div>

              {/* Jam Selesai */}
              <div>
                <label className="block font-medium">Jam Selesai</label>
                <input
                  required
                  // type="time"
                  placeholder="HH:MM"
                  value={formData.jam_selesai}
                  onChange={(e) =>
                    setFormData({ ...formData, jam_selesai: e.target.value })
                  }
                  className="border border-black p-1 rounded w-full"
                />
              </div>

              {/* Keterangan */}
              <div>
                <label className="block font-medium">Deskripsi Lembur</label>
                <textarea
                  placeholder="Contoh: Menginput data laporan keuangan."
                  value={formData.keterangan}
                  onChange={(e) =>
                    setFormData({ ...formData, keterangan: e.target.value })
                  }
                  className="border p-1 rounded w-full"
                />
              </div>

              {/* Lampiran */}
              <div>
                <label className="block font-medium">Lampiran (Opsional)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) =>
                    setFormData({ ...formData, file: e.target.files[0] })
                  }
                  className="border p-1 rounded w-full"
                />
              </div>

              {/* Tombol */}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                  onClick={() => setShowFormModal(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Pending Requests */}
      {lemburModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          onClick={() => setLemburModal(false)}
        >
          <div
            className="bg-white text-black rounded-lg shadow-lg w-full max-w-4xl mx-4 relative flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between rounded-lg border-b px-6 py-4 sticky top-0 bg-white z-10">
              <h1 className="text-xl font-bold">Pengajuan Lembur</h1>
              <button
                onClick={() => setLemburModal(false)}
                className="text-gray-500 hover:text-black text-xl"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-2 overflow-y-auto flex-1">
              {lemburList.filter((item) => item.status_lembur === "pending")
                .length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada pengajuan.
                </div>
              ) : (
                <table className="min-w-full border text-sm">
                  <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr>
                      <th className="border px-2 py-1">Nama</th>
                      <th className="border px-2 py-1">Tanggal</th>
                      <th className="border px-2 py-1">Jam</th>
                      <th className="border px-2 py-1">Deskripsi</th>
                      <th className="border px-2 py-1">Lampiran</th>
                      <th className="border px-2 py-1">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lemburList
                      .filter((item) => item.status_lembur === "pending")
                      .map((item) => (
                        <tr key={item.id_lembur}>
                          <td className="border px-2 py-1 capitalize">
                            {item.nama_karyawan}
                          </td>
                          <td className="border px-2 py-1">{item.tanggal}</td>
                          <td className="border px-2 py-1">
                            {item.jam_mulai} - {item.jam_selesai}
                          </td>
                          <td className="border px-2 py-1">
                            {item.keterangan}
                          </td>
                          <td className="border px-2 py-1 text-center">
                            {item.path_lampiran ? (
                              <a
                                href={item.path_lampiran}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline text-xs"
                              >
                                Lihat
                              </a>
                            ) : (
                              "-"
                            )}
                          </td>

                          <td className="border px-2 py-1">
                            <div className="flex gap-1">
                              <button
                                className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                                onClick={() => handleApprove(item.id_lembur)}
                              >
                                Approve
                              </button>
                              <button
                                className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                                onClick={() => handleReject(item.id_lembur)}
                              >
                                Tolak
                              </button>
                              <button
                                className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
                                onClick={() => handleDelete(item.id_lembur)}
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lembur;
