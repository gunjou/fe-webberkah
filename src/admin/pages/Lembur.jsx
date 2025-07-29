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
  const [editLemburId, setEditLemburId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
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
  const fetchLembur = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const start = `${selectedYear}-${String(selectedMonth).padStart(
        2,
        "0"
      )}-01`;
      const end = new Date(selectedYear, selectedMonth, 0)
        .toISOString()
        .split("T")[0];

      const res = await api.get("/lembur/", {
        headers: { Authorization: `Bearer ${token}` },
        params: { start_date: start, end_date: end },
      });

      let data = res.data.data;
      const list = Array.isArray(data) ? data : data ? [data] : [];

      let filteredList = list;
      if (idKaryawanFilter && !isNaN(parseInt(idKaryawanFilter))) {
        filteredList = filteredList.filter(
          (item) => item.id_karyawan === parseInt(idKaryawanFilter)
        );
      }
      if (statusLemburFilter) {
        filteredList = filteredList.filter(
          (item) => item.status_lembur === statusLemburFilter
        );
      }

      setLemburList(filteredList);
    } catch (err) {
      console.error("Gagal fetch lembur:", err);
      setLemburList([]);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, idKaryawanFilter, statusLemburFilter]);

  const fetchPegawaiList = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/pegawai/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Urutkan dan kapitalisasi nama
      const sortedCapitalized = res.data
        .map((pegawai) => ({
          ...pegawai,
          nama: pegawai.nama
            .split(" ")
            .map(
              (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join(" "),
        }))
        .sort((a, b) => a.nama.localeCompare(b.nama)); // urut berdasarkan nama

      setPegawaiList(sortedCapitalized);
    } catch (error) {
      console.error("Gagal ambil data pegawai:", error);
    }
  };

  useEffect(() => {
    fetchLembur();
    fetchPegawaiList();
  }, [selectedMonth, selectedYear, idKaryawanFilter, statusLemburFilter]);

  const handleEdit = (item) => {
    setEditLemburId(item.id_lembur);
    setFormData({
      id_karyawan: item.id_karyawan,
      tanggal: item.tanggal, // pastikan format yyyy-mm-dd
      jam_mulai: item.jam_mulai,
      jam_selesai: item.jam_selesai,
      keterangan: item.keterangan,
      file: "", // file tidak diisi saat edit kecuali user upload baru
    });
    setShowFormModal(true);
  };

  const formatJamLembur = (jamLembur) => {
    if (!jamLembur || isNaN(jamLembur)) return "-";

    const jam = Math.floor(jamLembur);
    const menit = Math.round((jamLembur - jam) * 60);

    if (jam > 0 && menit > 0) return `${jam} jam ${menit} menit`;
    if (jam > 0) return `${jam} jam`;
    if (menit > 0) return `${menit} menit`;

    return "0 menit";
  };

  const totalKeseluruhanBayaran = lemburList.reduce(
    (total, item) => total + (item.total_bayaran || 0),
    0
  );

  // Excel download functionality
  const downloadExcel = () => {
    const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString(
      "id-ID",
      { month: "long" }
    );
    const fileName = `Data_Lembur_${monthName}_${selectedYear}`;

    const titleRow = ["Data Lembur Pegawai"];
    const periodeRow = [`Bulan: ${monthName} ${selectedYear}`];

    const formatJamLembur = (jamLembur) => {
      if (!jamLembur || isNaN(jamLembur)) return "-";
      const jam = Math.floor(jamLembur);
      const menit = Math.round((jamLembur - jam) * 60);
      if (jam > 0 && menit > 0) return `${jam} jam ${menit} menit`;
      if (jam > 0) return `${jam} jam`;
      if (menit > 0) return `${menit} menit`;
      return "0 menit";
    };

    const header = [
      "No",
      "Nama",
      "Tanggal",
      "Jam Mulai",
      "Jam Selesai",
      "Jam Lembur",
      "Bayar/Jam",
      "Total Bayaran",
      "Deskripsi",
      "Lampiran",
      "Status",
    ];

    const rows = lemburList.map((item, idx) => [
      idx + 1,
      item.nama_karyawan || "-",
      item.tanggal,
      item.jam_mulai?.slice(0, 5),
      item.jam_selesai?.slice(0, 5),
      formatJamLembur(item.jam_lembur),
      item.bayaran_perjam?.toLocaleString("id-ID") ?? "-",
      item.total_bayaran?.toLocaleString("id-ID") ?? "-",
      item.keterangan || "-",
      item.path_lampiran || "-",
      item.status_lembur,
    ]);

    const totalPembayaran = lemburList.reduce(
      (sum, item) => sum + (item.total_bayaran || 0),
      0
    );

    const worksheet = XLSX.utils.aoa_to_sheet([
      titleRow,
      periodeRow,
      [],
      header,
      ...rows,
      [],
      [
        `Total Pembayaran Keseluruhan: Rp ${totalPembayaran.toLocaleString(
          "id-ID"
        )}`,
      ],
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Lembur");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  // PDF download functionality
  const downloadPDF = () => {
    const doc = new jsPDF("landscape");

    const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString(
      "id-ID",
      { month: "long" }
    );
    const fileName = `Data_Lembur_${monthName}_${selectedYear}`;
    const title = "Data Lembur Pegawai";
    const periodeText = `Bulan: ${monthName} ${selectedYear}`;

    doc.setFontSize(14);
    doc.text(title, 14, 15);
    doc.setFontSize(11);
    doc.text(periodeText, 14, 22);

    const formatJamLembur = (jamLembur) => {
      if (!jamLembur || isNaN(jamLembur)) return "-";
      const jam = Math.floor(jamLembur);
      const menit = Math.round((jamLembur - jam) * 60);
      if (jam > 0 && menit > 0) return `${jam} jam ${menit} menit`;
      if (jam > 0) return `${jam} jam`;
      if (menit > 0) return `${menit} menit`;
      return "0 menit";
    };

    const tableHead = [
      "No",
      "Nama",
      "Tanggal",
      "Jam Mulai",
      "Jam Selesai",
      "Jam Lembur",
      "Bayar/Jam",
      "Total Bayaran",
      "Deskripsi",
      "Lampiran",
      "Status",
    ];

    const tableBody = lemburList.map((item, idx) => [
      idx + 1,
      item.nama_karyawan || "-",
      item.tanggal,
      item.jam_mulai?.slice(0, 5),
      item.jam_selesai?.slice(0, 5),
      formatJamLembur(item.jam_lembur),
      item.bayaran_perjam?.toLocaleString("id-ID") ?? "-",
      item.total_bayaran?.toLocaleString("id-ID") ?? "-",
      item.keterangan || "-",
      item.path_lampiran || "-",
      item.status_lembur,
    ]);

    const totalPembayaran = lemburList.reduce(
      (sum, item) => sum + (item.total_bayaran || 0),
      0
    );

    doc.autoTable({
      head: [tableHead],
      body: tableBody,
      startY: 28,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255] },
    });

    const totalText = `Total Pembayaran Keseluruhan: Rp ${totalPembayaran.toLocaleString(
      "id-ID"
    )}`;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(totalText, 14, doc.lastAutoTable.finalY + 10);

    doc.save(`${fileName}.pdf`);
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
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-2 py-2 border rounded-lg text-sm"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("id-ID", { month: "long" })}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
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

          {/* Filter Pegawai */}
          <select
            value={idKaryawanFilter}
            onChange={(e) => setIdKaryawanFilter(e.target.value)}
            className="px-2 py-2 border rounded-lg text-sm"
          >
            <option value="">Pilih Pegawai</option>
            {pegawaiList.map((pegawai) => (
              <option
                key={pegawai.id_karyawan}
                value={pegawai.id_karyawan}
                className="capitalize"
              >
                {pegawai.nama}
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
                  <th className="border px-2 py-1 text-xs">No</th>
                  <th className="border px-2 py-1 text-xs">Nama</th>
                  <th className="border px-2 py-1 text-xs">Tanggal</th>
                  <th className="border px-2 py-1 text-xs">Jam Mulai</th>
                  <th className="border px-2 py-1 text-xs">Jam Selesai</th>
                  <th className="border px-2 py-1 text-xs">Jam Lembur</th>
                  <th className="border px-2 py-1 text-xs">Bayar/Jam</th>
                  <th className="border px-2 py-1 text-xs">Total Bayaran</th>
                  <th className="border px-2 py-1 text-xs">Deskripsi</th>
                  <th className="border px-2 py-1 text-xs">Lampiran</th>
                  <th className="border px-2 py-1 text-xs">Status</th>
                  <th className="border px-2 py-1 text-xs">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {lemburList.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4 text-gray-500">
                      Tidak ada data lembur.
                    </td>
                  </tr>
                ) : (
                  lemburList.map((item, index) => (
                    <tr key={item.id_lembur}>
                      <td className="border px-2 py-1 text-center text-xs">
                        {index + 1}
                      </td>
                      <td className="border px-2 py-1 capitalize text-xs">
                        {item.nama_karyawan}
                      </td>
                      <td className="border px-2 py-1 text-xs">
                        {item.tanggal}
                      </td>
                      <td className="border px-2 py-1 text-xs">
                        {item.jam_mulai?.slice(0, 5)}
                      </td>
                      <td className="border px-2 py-1  text-xs">
                        {item.jam_selesai?.slice(0, 5)}
                      </td>
                      <td className="border px-2 py-1 capitalize text-xs">
                        {formatJamLembur(item.jam_lembur)}
                      </td>
                      <td className="border px-2 py-1 text-right text-xs">
                        Rp.{item.bayaran_perjam?.toLocaleString("id-ID") ?? "-"}
                      </td>
                      <td className="border px-2 py-1 text-right text-xs">
                        Rp.{item.total_bayaran?.toLocaleString("id-ID") ?? "-"}
                      </td>
                      <td className="border px-2 py-1 text-xs">
                        {item.keterangan}
                      </td>
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
                      <td className="border px-2 py-1 font-semibold text-xs text-center">
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
                      <td className="border px-2 py-1 text-center">
                        <div className="flex gap-1 justify-center">
                          {item.status_lembur === "pending" ? (
                            <span className="text-red-700 font-semibold text-xs">
                              Menunggu Persetujuan
                            </span>
                          ) : (
                            <>
                              <button
                                className="bg-yellow-500 text-white px-2 py-1 rounded-lg text-xs"
                                onClick={() => handleEdit(item)}
                              >
                                Edit
                              </button>
                              <button
                                disabled={
                                  lemburActionLoading === item.id_lembur
                                }
                                className="bg-red-600 text-white px-2 py-1 rounded-lg text-xs disabled:opacity-50"
                                onClick={() => handleDelete(item.id_lembur)}
                              >
                                {lemburActionLoading === item.id_lembur
                                  ? "Menghapus..."
                                  : "Hapus"}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="text-sm font-medium text-gray-700">
            Total Pembayaran:{" "}
            <span className="text-blue-700 font-semibold">
              Rp {totalKeseluruhanBayaran.toLocaleString("id-ID")}
            </span>
          </div>

          <button
            className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
            onClick={() => {
              fetchPegawaiList();
              setShowFormModal(true);
            }}
          >
            Tambah Lembur
          </button>
        </div>
      </div>
      {showFormModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
          onClick={() => {
            setShowFormModal(false);
            setEditLemburId(null);
            setFormData({
              id_karyawan: "",
              tanggal: "",
              jam_mulai: "",
              jam_selesai: "",
              keterangan: "",
              file: "",
            });
          }}
        >
          <div
            className="bg-white rounded-lg w-full max-w-lg p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">
              {editLemburId ? "Edit Lembur" : "Form Tambah Lembur"}
            </h2>
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
                form.append("jam_mulai", formData.jam_mulai.slice(0, 5));
                form.append("jam_selesai", formData.jam_selesai.slice(0, 5));
                form.append("keterangan", formData.keterangan);
                if (formData.file) {
                  form.append("file", formData.file);
                }

                try {
                  if (editLemburId) {
                    // Edit mode
                    await api.put(`/lembur/${editLemburId}`, form, {
                      headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                      },
                    });
                    alert("Lembur berhasil diupdate!");
                  } else {
                    // Tambah mode
                    await api.post("/lembur/pengajuan", form, {
                      headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                      },
                    });
                    alert("Lembur berhasil ditambahkan!");
                  }
                  fetchLembur(tanggal);
                  setShowFormModal(false);
                  setEditLemburId(null);
                  setFormData({
                    id_karyawan: "",
                    tanggal: "",
                    jam_mulai: "",
                    jam_selesai: "",
                    keterangan: "",
                    file: "",
                  });
                } catch {
                  alert(
                    editLemburId
                      ? "Gagal mengupdate lembur."
                      : "Gagal menambahkan lembur."
                  );
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
                  type="time"
                  value={
                    formData.jam_mulai ? formData.jam_mulai.slice(0, 5) : ""
                  }
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
                  type="time"
                  value={
                    formData.jam_selesai ? formData.jam_selesai.slice(0, 5) : ""
                  }
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
                  onClick={() => {
                    setShowFormModal(false);
                    setEditLemburId(null);
                    setFormData({
                      id_karyawan: "",
                      tanggal: "",
                      jam_mulai: "",
                      jam_selesai: "",
                      keterangan: "",
                      file: "",
                    });
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  {editLemburId ? "Update" : "Simpan"}
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
