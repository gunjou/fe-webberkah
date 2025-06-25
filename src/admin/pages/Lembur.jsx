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

  useEffect(() => {
    fetchLembur(tanggal);
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
  const handleApprove = async (id) => {
    if (!window.confirm("Setujui lembur ini?")) return;
    setLemburActionLoading(id);
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/lembur/${id}/setujui`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchLembur(tanggal);
    } catch {
      alert("Gagal menyetujui lembur.");
    } finally {
      setLemburActionLoading(null);
    }
  };

  const handleReject = async (id_lembur) => {
    const alasan = lemburAlasanReject[id_lembur];
    if (!alasan || !alasan.trim()) {
      alert("Isi alasan penolakan.");
      return;
    }
    setLemburActionLoading(id_lembur);
    try {
      const token = localStorage.getItem("token");
      await api.post(
        `/lembur/${id_lembur}/tolak`,
        { alasan_penolakan: alasan },
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
    } catch {
      alert("Gagal menghapus lembur.");
    } finally {
      setLemburActionLoading(null);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Lembur</h2>
      {/* Date Filter Section */}
      <div className="flex items-center gap-4 mb-4">
        {/* Filter Tanggal */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Filter Tanggal"
            value={tanggal}
            onChange={setTanggal}
            format="DD/MM/YYYY"
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
          onClick={() => setLemburModal(true)}
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

      {/* Table for Lembur Data */}
      <div className="bg-white shadow rounded-lg px-6 pb-6 pt-4">
        <span className="text-sm font-semibold">
          Detail Rekapan Lembur Karyawan
        </span>
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <div className="max-h-80 overflow-y-auto">
            <table className="min-w-full text-sm border">
              <thead className="bg-gray-100 sticky top-0 z-10">
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
                      <td className="border px-2 py-1">{item.jam_mulai}</td>
                      <td className="border px-2 py-1">{item.jam_selesai}</td>
                      <td className="border px-2 py-1">{item.keterangan}</td>
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
      </div>

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
                            {lemburRejectId === item.id_lembur ? (
                              <div className="flex flex-col gap-1">
                                <input
                                  type="text"
                                  className="border px-2 py-1 rounded text-xs"
                                  placeholder="Alasan penolakan"
                                  value={
                                    lemburAlasanReject[item.id_lembur] || ""
                                  }
                                  onChange={(e) =>
                                    setLemburAlasanReject({
                                      ...lemburAlasanReject,
                                      [item.id_lembur]: e.target.value,
                                    })
                                  }
                                  disabled={
                                    lemburActionLoading === item.id_lembur
                                  }
                                />
                                <div className="flex gap-1">
                                  <button
                                    className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                                    onClick={() => handleReject(item.id_lembur)}
                                  >
                                    Tolak
                                  </button>
                                  <button
                                    className="bg-gray-300 text-black px-2 py-1 rounded text-xs"
                                    onClick={() => setLemburRejectId(null)}
                                  >
                                    Batal
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex gap-1">
                                <button
                                  className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                                  onClick={() => handleApprove(item.id_lembur)}
                                >
                                  Approve
                                </button>
                                <button
                                  className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                                  onClick={() =>
                                    setLemburRejectId(item.id_lembur)
                                  }
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
                            )}
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
