/* eslint-disable jsx-a11y/anchor-is-valid */
import { React, useEffect, useState } from "react";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import api from "../../shared/Api";
import { FiX } from "react-icons/fi";

const kolom = [
  { id: "no", label: "No", minWidth: 20 },
  { id: "nama", label: "Nama", minWidth: 40 },
  { id: "tipe", label: "Status", minWidth: 80 },
  { id: "jumlah_hadir", label: "Hadir", minWidth: 10 },
  { id: "jumlah_izin", label: "Izin", minWidth: 10 },
  { id: "jumlah_sakit", label: "Sakit", minWidth: 10 },
  { id: "jumlah_alpha", label: "Alpha", minWidth: 10 },
  // { id: "total_jam_kerja", label: "Jam Kerja", minWidth: 50 },
  // { id: "jam_normal", label: "Normal", minWidth: 40 },
  //  { id: "jam_terlambat", label: "Terlambat", minWidth: 40 },
  { id: "jam_kurang", label: "Kurang", minWidth: 40 },
  { id: "gaji_pokok", label: "Gaji Pokok", minWidth: 50 },
  { id: "potongan", label: "Potongan", minWidth: 40 },
  { id: "tunjangan_kehadiran", label: "Tunjangan Hadir", minWidth: 40 },
  { id: "gaji_bersih", label: "Gaji Bersih", minWidth: 50 },
  { id: "total_lembur", label: "Total Lembur", minWidth: 30 },
  { id: "total_menit_lembur", label: "Waktu Lembur", minWidth: 30 },
  { id: "total_bayaran_lembur", label: "Gaji Lembur", minWidth: 40 },
  { id: "total_gaji", label: "Total Gaji", minWidth: 40 },
];

const formatTerlambat = (menit) => {
  if (!menit || isNaN(menit)) return "-";
  const jam = Math.floor(menit / 60);
  const sisaMenit = menit % 60;
  if (jam > 0 && sisaMenit > 0) return `${jam} jam ${sisaMenit} menit`;
  if (jam > 0) return `${jam} jam`;
  return `${sisaMenit} menit`;
};

const PerhitunganGaji = () => {
  const [absen, setAbsen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [showModal, setShowModal] = useState(false);
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const [tipeFilter, setTipeFilter] = useState("semua");

  const fetchData = (start = "", end = "") => {
    const token = localStorage.getItem("token");
    if (!start || !end) return;

    api
      .get("/perhitungan-gaji/rekapan", {
        params: { start, end }, // Kirim parameter start dan end (format dd-mm-yyyy)
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const sorted = res.data.data
          .filter((item) => item.nama)
          .sort((a, b) => a.nama.localeCompare(b.nama));
        setAbsen(sorted);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  };

  const totalGaji = absen.reduce(
    (acc, item) => {
      const gajiBersihManual = item.gaji_bersih_tanpa_lembur || 0;
      const lembur = item.total_bayaran_lembur || 0;
      const total = item.gaji_bersih || 0;

      if (item.tipe === "pegawai tetap") {
        acc.bersih.tetap += gajiBersihManual;
        acc.lembur.tetap += lembur;
        acc.total.tetap += total;
      } else if (item.tipe === "pegawai tidak tetap") {
        acc.bersih.tidaktetap += gajiBersihManual;
        acc.lembur.tidaktetap += lembur;
        acc.total.tidaktetap += total;
      }

      acc.bersih.total += gajiBersihManual;
      acc.lembur.total += lembur;
      acc.total.total += total;

      return acc;
    },
    {
      bersih: { tetap: 0, tidaktetap: 0, total: 0 },
      lembur: { tetap: 0, tidaktetap: 0, total: 0 },
      total: { tetap: 0, tidaktetap: 0, total: 0 },
    }
  );

  useEffect(() => {
    const start = `01-${String(selectedMonth).padStart(
      2,
      "0"
    )}-${selectedYear}`;
    const endDateObj = new Date(selectedYear, selectedMonth, 0); // last day of month
    const end = `${String(endDateObj.getDate()).padStart(2, "0")}-${String(
      selectedMonth
    ).padStart(2, "0")}-${selectedYear}`;
    fetchData(start, end);
  }, [selectedMonth, selectedYear]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...absen].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const valueA = a[sortConfig.key] || "";
    const valueB = b[sortConfig.key] || "";
    if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const filteredData = sortedData.filter((item) => {
    const cocokNama = item.nama
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const cocokTipe =
      tipeFilter === "semua" || item.tipe.toLowerCase() === tipeFilter;
    return cocokNama && cocokTipe;
  });

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = searchTerm
    ? filteredData.slice(0, rowsPerPage)
    : filteredData.slice(indexOfFirstRow, indexOfLastRow);

  const nextPage = () => {
    if (currentPage < Math.ceil(absen.length / rowsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const formatTanggalSlash = (dateStr) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const getDateLabel = () => {
    const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString(
      "id-ID",
      { month: "long" }
    );
    return `Bulan ${monthName} ${selectedYear}`;
  };

  const getFileName = () => {
    const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString(
      "id-ID",
      { month: "long" }
    );
    return `Rekapan Gaji Bulan ${monthName} ${selectedYear}`;
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const toTitleCase = (str) => {
    if (!str) return "-";
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const downloadExcel = () => {
    const confirmDownload = window.confirm(
      "Apakah Anda yakin ingin mengunduh data sebagai file Excel?"
    );
    if (!confirmDownload) return;

    // Header kolom, pastikan sesuai dengan PDF
    const header = [
      "No",
      "Nama",
      "Tipe",
      "Jumlah Hadir",
      "Jumlah Izin",
      "Jumlah Sakit",
      "Jumlah Alpha",
      "Jam Kerja",
      "Jam Terlambat",
      "Gaji Pokok",
      "Potongan",
      "Tunjangan Kehadiran",
      "Gaji Bersih Tanpa Lembur",
      "Lembur",
      "Menit Lembur",
      "Bayaran Lembur",
      "Gaji Bersih",
    ];

    // Data baris utama, disesuaikan dengan format PDF
    const rows = filteredData.map((item, idx) => [
      idx + 1,
      item.nama,
      item.tipe,
      item.jumlah_hadir ?? "-",
      item.jumlah_izin ?? "-",
      item.jumlah_sakit ?? "-",
      item.jumlah_alpha ?? "-",
      formatTerlambat(item.total_jam_kerja),
      formatTerlambat(item.jam_terlambat + item.jam_kurang),
      formatRupiah(item.gaji_pokok),
      formatRupiah(item.potongan),
      formatRupiah(item.tunjangan_kehadiran),
      formatRupiah(item.gaji_bersih_tanpa_lembur),
      item.total_lembur ?? "-",
      item.total_menit_lembur ?? "-",
      formatRupiah(item.total_bayaran_lembur),
      formatRupiah(item.gaji_bersih),
    ]);

    // Ringkasan total gaji (mirip dengan PDF)
    const summaryRows = [
      [],
      ["RINGKASAN TOTAL GAJI"],
      [],
      ["Gaji Bersih"],
      ["Pegawai Tetap", formatRupiah(totalGaji.bersih.tetap)],
      ["Pegawai Tidak Tetap", formatRupiah(totalGaji.bersih.tidaktetap)],
      ["Total Semua", formatRupiah(totalGaji.bersih.total)],
      [],
      ["Gaji Lembur"],
      ["Pegawai Tetap", formatRupiah(totalGaji.lembur.tetap)],
      ["Pegawai Tidak Tetap", formatRupiah(totalGaji.lembur.tidaktetap)],
      ["Total Semua", formatRupiah(totalGaji.lembur.total)],
      [],
      ["Total Gaji (Bersih + Lembur)"],
      ["Pegawai Tetap", formatRupiah(totalGaji.total.tetap)],
      ["Pegawai Tidak Tetap", formatRupiah(totalGaji.total.tidaktetap)],
      ["Total Semua", formatRupiah(totalGaji.total.total)],
    ];

    // Gabungkan header, rows, dan ringkasan ke dalam worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([
      header,
      ...rows,
      ...summaryRows,
    ]);

    // Atur lebar kolom agar rapi
    worksheet["!cols"] = [
      { wch: 5 }, // Kolom No
      { wch: 20 }, // Kolom Nama
      { wch: 10 }, // Kolom Tipe
      { wch: 12 }, // Kolom Kehadiran
      { wch: 12 }, // Kolom Izin
      { wch: 12 }, // Kolom Sakit
      { wch: 12 }, // Kolom Alpha
      { wch: 15 }, // Kolom Jam Kerja
      { wch: 15 }, // Kolom Jam Terlambat
      { wch: 15 }, // Kolom Gaji Pokok
      { wch: 15 }, // Kolom Potongan
      { wch: 20 }, // Kolom Tunjangan Kehadiran
      { wch: 20 }, // Kolom Gaji Bersih Tanpa Lembur
      { wch: 10 }, // Kolom Lembur
      { wch: 10 }, // Kolom Menit Lembur
      { wch: 20 }, // Kolom Bayaran Lembur
      { wch: 20 }, // Kolom Gaji Bersih
    ];

    // Buat workbook dan tambahkan worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekapan Gaji");

    // Menyimpan file Excel
    XLSX.writeFile(workbook, `${getFileName()}.xlsx`);
  };

  const downloadPDF = () => {
    const confirmDownload = window.confirm(
      "Apakah Anda yakin ingin mengunduh data sebagai file PDF?"
    );
    if (!confirmDownload) return;

    const doc = new jsPDF({ orientation: "landscape" });

    const title = "Rekapan Gaji";
    const dateStr = getDateLabel();

    doc.setFontSize(14);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.text(dateStr, 14, 22);

    const header = kolom.map((k) =>
      k.label
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
    const rows = filteredData.map((item, idx) => [
      idx + 1,
      item.nama,
      item.tipe,
      item.jumlah_hadir ?? "-",
      item.jumlah_izin ?? "-",
      item.jumlah_sakit ?? "-",
      item.jumlah_alpha ?? "-",
      formatTerlambat(item.jam_terlambat + item.jam_kurang),
      formatRupiah(item.gaji_pokok),
      formatRupiah(item.potongan),
      formatRupiah(item.tunjangan_kehadiran),
      formatRupiah(item.gaji_bersih_tanpa_lembur),
      item.total_lembur ?? "-",
      formatTerlambat(item.total_menit_lembur) ?? "-",
      formatRupiah(item.total_bayaran_lembur),
      formatRupiah(item.gaji_bersih),
    ]);

    doc.autoTable({
      head: [header],
      body: rows,
      startY: 30,
      styles: { fontSize: 8, cellPadding: 1 },
      headStyles: {
        fillColor: [139, 0, 0],
        textColor: [255, 255, 255],
        valign: "middle",
      },
      columnStyles: {
        0: { halign: "center" },
        1: { halign: "left" },
        2: { halign: "left" },
        3: { halign: "center" },
        4: { halign: "center" },
        5: { halign: "center" },
        6: { halign: "center" },
        7: { halign: "left" },
        8: { halign: "left", cellWidth: 25 },
        9: { halign: "left", cellWidth: 25 },
        10: { halign: "left", cellWidth: 25 },
        11: { halign: "left", cellWidth: 25 },
        12: { halign: "left" },
        13: { halign: "left" },
        14: { halign: "left", cellWidth: 25 },
        15: { halign: "left", cellWidth: 25 },
      },
    });

    let y = doc.lastAutoTable.finalY + 10;

    // Estimasi tinggi bagian ringkasan
    const estimatedRingkasanHeight = 3 * (3 * 5 + 6 + 3); // 3 sections × (3 rows × 5px + 6px title + 3px gap)
    const pageHeight = doc.internal.pageSize.getHeight();

    // Jika bagian ringkasan akan melewati halaman → buat halaman baru
    if (y + estimatedRingkasanHeight > pageHeight - 10) {
      doc.addPage();
      y = 15; // reset posisi y
    }

    // Ringkasan Total Gaji
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Ringkasan Total Gaji", 14, y);
    y += 7;

    const sections = [
      {
        title: "Gaji Bersih",
        data: [
          ["Pegawai Tetap", totalGaji.bersih.tetap],
          ["Pegawai Tidak Tetap", totalGaji.bersih.tidaktetap],
          ["Total Semua", totalGaji.bersih.total],
        ],
      },
      {
        title: "Gaji Lembur",
        data: [
          ["Pegawai Tetap", totalGaji.lembur.tetap],
          ["Pegawai Tidak Tetap", totalGaji.lembur.tidaktetap],
          ["Total Semua", totalGaji.lembur.total],
        ],
      },
      {
        title: "Total Gaji (Bersih + Lembur)",
        data: [
          ["Pegawai Tetap", totalGaji.total.tetap],
          ["Pegawai Tidak Tetap", totalGaji.total.tidaktetap],
          ["Total Semua", totalGaji.total.total],
        ],
      },
    ];

    doc.setFontSize(10);
    sections.forEach((section) => {
      doc.setFont("helvetica", "bold");
      doc.text(section.title, 14, y);
      y += 6;

      section.data.forEach(([label, value]) => {
        doc.setFont("helvetica", "normal");
        doc.text(`${label}`, 20, y);
        doc.setFont("helvetica", "bold");
        doc.text(`${formatRupiah(value)}`, 80, y, { align: "left" });
        y += 5;
      });

      y += 3; // spasi antar section
    });

    doc.save(`${getFileName()}.pdf`);
  };

  // Tambahkan useEffect untuk fetch otomatis saat tanggal berubah
  useEffect(() => {
    const start = `01-${String(selectedMonth).padStart(
      2,
      "0"
    )}-${selectedYear}`;
    const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
    const end = `${String(lastDay).padStart(2, "0")}-${String(
      selectedMonth
    ).padStart(2, "0")}-${selectedYear}`;
    fetchData(start, end);
  }, [selectedMonth, selectedYear]);

  return (
    <div className="Perhitungan Gaji">
      <div className="flex">
        <div className="w-full h-full">
          <div className="title flex text-2xl pt-4 pl-4 font-bold">
            Perhitungan Gaji
          </div>
          <div className="tabel rounded-[20px] mt-2 mr-4 ml-4 px-2 shadow-md bg-white w-full h-full">
            <div className="ml-2 mb-2 pt-4 flex items-start justify-start gap-4 flex-wrap">
              <div className="flex flex-col">
                <span className="text-sm font-semibold">
                  Detail Gaji Pegawai Berkah Angsana
                </span>
                <div className="flex gap-2 mt-2">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="px-2 py-1 border rounded-lg text-sm"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString("id-ID", {
                          month: "long",
                        })}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="px-2 py-1 border rounded-lg text-sm"
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

                  <select
                    value={tipeFilter}
                    onChange={(e) => setTipeFilter(e.target.value)}
                    className="border rounded-lg px-2 py-1 text-sm"
                  >
                    <option value="semua">Semua Tipe</option>
                    <option value="pegawai tetap">Pegawai Tetap</option>
                    <option value="pegawai tidak tetap">
                      Pegawai Tidak Tetap
                    </option>
                  </select>

                  <div className="flex items-center ml-4 justify-end space-x-2 flex-wrap w-full">
                    <input
                      type="text"
                      className="block p-4 text-sm text-gray-900 border border-gray-300 rounded-[20px] w-50 h-9 bg-gray-50"
                      placeholder="Search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <button
                      type="button"
                      className="flex items-center text-[12px] bg-green-500 text-white hover:bg-green-700 rounded-[20px] px-4 py-2"
                      onClick={downloadExcel}
                    >
                      <span className="text-xs pr-2">
                        <FaFileExcel />
                      </span>
                      Unduh Excel
                    </button>
                    <button
                      type="button"
                      className="flex items-center text-[12px] bg-red-700 text-white hover:bg-red-500 rounded-[20px] px-4 py-2"
                      onClick={downloadPDF}
                    >
                      <span className="text-xs pr-2">
                        <FaFilePdf />
                      </span>
                      Unduh PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto mt-2 pl-2">
              <div className="bg-white rounded-lg shadow-md mr-2 overflow-y-auto overflow-x-auto ">
                <Paper sx={{ width: "100%", overflow: "hidden" }}>
                  <TableContainer sx={{ maxHeight: 280, maxWidth: 900 }}>
                    {" "}
                    <Table stickyHeader>
                      <TableHead className="bg-[#e8ebea]">
                        <TableRow sx={{ height: "26px" }}>
                          {kolom.map((column, index) => (
                            <TableCell
                              key={column.id}
                              onClick={() => handleSort(column.id)}
                              style={{
                                minWidth: column.minWidth,
                                backgroundColor: "#4d4d4d",
                                color: "white",
                                fontWeight: "bold",
                                fontSize: "12px",
                                padding: "4px 10px",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                textAlign: "left",
                                borderRadius: index === 17 ? "0 10px 0 0" : "0",
                              }}
                            >
                              {column.label}
                              {sortConfig.key === column.id && (
                                <span style={{ marginLeft: 4 }}>
                                  {sortConfig.direction === "asc" ? " ▲" : " ▼"}
                                </span>
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {currentRows.length === 0 ? (
                          <TableRow sx={{ height: "22px" }}>
                            <TableCell
                              colSpan={kolom.length}
                              align="left"
                              sx={{ fontSize: "12px", padding: "4px" }}
                            >
                              Tidak ada yang cocok dengan pencarian Anda.
                            </TableCell>
                          </TableRow>
                        ) : (
                          currentRows.map((item, index) => (
                            <TableRow key={index} sx={{ height: "22px" }}>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                              >
                                {index + 1}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                className="capitalize"
                              >
                                {item.nama}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                className="capitalize"
                              >
                                {item.tipe}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="center"
                              >
                                {item.jumlah_hadir ?? "-"}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="center"
                              >
                                {item.jumlah_izin ?? "-"}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="center"
                              >
                                {item.jumlah_sakit ?? "-"}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="center"
                              >
                                {item.jumlah_alpha ?? "-"}
                              </TableCell>
                              {/* <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="center"
                              >
                                {formatTerlambat(item.total_jam_kerja)}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="center"
                              >
                                {formatTerlambat(item.jam_normal)}
                              </TableCell> */}
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="center"
                              >
                                {formatTerlambat(
                                  item.jam_terlambat + item.jam_kurang
                                )}
                              </TableCell>
                              {/* <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="center"
                              >
                                {formatTerlambat(item.jam_kurang)}
                              </TableCell> */}
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="left"
                              >
                                {formatRupiah(item.gaji_pokok)}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="left"
                              >
                                {formatRupiah(item.potongan)}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="left"
                              >
                                {formatRupiah(item.tunjangan_kehadiran)}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="left"
                              >
                                {formatRupiah(item.gaji_bersih_tanpa_lembur)}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="center"
                              >
                                {item.total_lembur ?? "-"}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="center"
                              >
                                {formatTerlambat(item.total_menit_lembur) ??
                                  "-"}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="left"
                              >
                                {formatRupiah(item.total_bayaran_lembur)}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="left"
                              >
                                {formatRupiah(item.gaji_bersih ?? "-")}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </div>
              <div className="mt-2 mb-2 flex justify-start space-x-2">
                <button
                  onClick={handleOpenModal}
                  className="bg-blue-600 text-white px-4 py-2 rounded-[20px] text-sm hover:bg-blue-700"
                >
                  Lihat Ringkasan Gaji
                </button>
              </div>

              {showModal && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black bg-opacity-50"
                  onClick={handleCloseModal}
                >
                  <div
                    className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h2 className="text-lg font-semibold mb-4">
                      Ringkasan Total Gaji
                    </h2>
                    <div className="space-y-4 text-sm">
                      {/* Gaji Bersih */}
                      <div>
                        <h3 className="font-semibold mb-1">Gaji Bersih</h3>
                        <div className="flex justify-between">
                          <span>Pegawai Tetap</span>
                          <span>{formatRupiah(totalGaji.bersih.tetap)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pegawai Tidak Tetap</span>
                          <span>
                            {formatRupiah(totalGaji.bersih.tidaktetap)}
                          </span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span>Total Semua</span>
                          <span>{formatRupiah(totalGaji.bersih.total)}</span>
                        </div>
                      </div>

                      {/* Gaji Lembur */}
                      <div>
                        <h3 className="font-semibold mb-1">Gaji Lembur</h3>
                        <div className="flex justify-between">
                          <span>Pegawai Tetap</span>
                          <span>{formatRupiah(totalGaji.lembur.tetap)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pegawai Tidak Tetap</span>
                          <span>
                            {formatRupiah(totalGaji.lembur.tidaktetap)}
                          </span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span>Total Semua</span>
                          <span>{formatRupiah(totalGaji.lembur.total)}</span>
                        </div>
                      </div>

                      {/* Total Gaji */}
                      <div>
                        <h3 className="font-semibold mb-1">
                          Total Gaji (Bersih + Lembur)
                        </h3>
                        <div className="flex justify-between">
                          <span>Pegawai Tetap</span>
                          <span>{formatRupiah(totalGaji.total.tetap)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pegawai Tidak Tetap</span>
                          <span>
                            {formatRupiah(totalGaji.total.tidaktetap)}
                          </span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-1">
                          <span>Total Semua</span>
                          <span>{formatRupiah(totalGaji.total.total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tombol Close dengan Icon */}
                    <button
                      onClick={handleCloseModal}
                      className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
                    >
                      <FiX />
                    </button>
                  </div>
                </div>
              )}

              {/* <div className="mt-2 ml-2 text-left space-y-0.5 text-sm font-semibold w-fit">
                <div className="flex">
                  <span className="w-56 text-xs">Total Gaji Pegawai Tetap</span>
                  <span className="mr-1">:</span>
                  <span className="font-bold text-xs">
                    {formatRupiah(totalGaji.tetap)}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-56 text-xs">
                    Total Gaji Pegawai Tidak Tetap
                  </span>
                  <span className="mr-1">:</span>
                  <span className="font-bold text-xs">
                    {formatRupiah(totalGaji.tidaktetap)}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-56 text-xs">Total Gaji Semua Pegawai</span>
                  <span className="mr-1">:</span>
                  <span className="font-bold text-xs">
                    {formatRupiah(totalGaji.total)}
                  </span>
                </div>
              </div> */}

              {/* Move buttons below pagination */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerhitunganGaji;
