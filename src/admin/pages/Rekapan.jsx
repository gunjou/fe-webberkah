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
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { MdClose } from "react-icons/md";

const kolom = [
  { id: "no", label: "No", minWidth: 30 },
  { id: "nama", label: "Nama Pegawai", minWidth: 80 },
  { id: "jenis", label: "Jenis Pegawai", minWidth: 60 },
  { id: "jumlah_hadir", label: "Hadir", minWidth: 40 },
  { id: "jumlah_izin", label: "Izin", minWidth: 40 },
  { id: "jumlah_sakit", label: "Sakit", minWidth: 40 },
  { id: "jumlah_alpha", label: "Alpha", minWidth: 40 },
  { id: "jumlah_lembur", label: "Lembur", minWidth: 40 },
  { id: "dinas_luar", label: "Dinas", minWidth: 40 },
  { id: "total_jam_kerja", label: "Kerja", minWidth: 60 },
  { id: "total_jam_kerja_normal", label: "Normal", minWidth: 60 },
  { id: "total_jam_terlambat", label: "Terlambat", minWidth: 60 },
  { id: "total_jam_kurang", label: "Bolos", minWidth: 60 },
  { id: "action", label: "Action", minWidth: 60 }, // Tambah kolom action
];

const formatTerlambat = (menit) => {
  if (!menit || isNaN(menit)) return "-";
  const jam = Math.floor(menit / 60);
  const sisaMenit = menit % 60;
  if (jam > 0 && sisaMenit > 0) return `${jam} jam ${sisaMenit} menit`;
  if (jam > 0) return `${jam} jam`;
  return `${sisaMenit} menit`;
};

const Rekapan = () => {
  const [absen, setAbsen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [openModal, setOpenModal] = useState(false);
  const [detailData, setDetailData] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedNama, setSelectedNama] = useState("");

  const fetchData = (start = "", end = "") => {
    const token = localStorage.getItem("token");
    if (!start || !end) return;

    api
      .get("/rekapan/absensi", {
        params: {
          start: start,
          end: end,
        },
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const sorted = res.data.rekap
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

  useEffect(() => {
    const start = `01-${String(selectedMonth).padStart(
      2,
      "0"
    )}-${selectedYear}`;
    const endDateObj = new Date(selectedYear, selectedMonth, 0);
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

  const filteredData = sortedData.filter((item) =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    return `Rekapan Presensi Bulan ${monthName} ${selectedYear}`;
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

    const header = kolom.map((k) => k.label);
    const rows = filteredData.map((item, indeks) => [
      indeks + 1,
      toTitleCase(item.nama),
      toTitleCase(item.jenis),

      item.jumlah_hadir || "-",
      item.jumlah_izin || "-",
      item.jumlah_sakit || "-",
      item.jumlah_alpha || "-",
      item.jumlah_lembur || "-",
      item.dinas_luar || "-",
      item.total_jam_kerja === null
        ? "-"
        : formatTerlambat(item.total_jam_kerja),
      item.total_jam_kerja_normal === null
        ? "-"
        : formatTerlambat(item.total_jam_kerja_normal),
      item.total_jam_terlambat === null
        ? "-"
        : formatTerlambat(item.total_jam_terlambat),
      item.total_jam_kurang === null
        ? "-"
        : formatTerlambat(item.total_jam_kurang),
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekapan Presensi");
    XLSX.writeFile(workbook, `${getFileName()}.xlsx`);
  };

  const downloadPDF = () => {
    const confirmDownload = window.confirm(
      "Apakah Anda yakin ingin mengunduh data sebagai file PDF?"
    );
    if (!confirmDownload) return;

    const doc = new jsPDF({ orientation: "landscape" });
    const title = "Rekapan Presensi";
    const dateStr = getDateLabel();

    doc.setFontSize(14);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.text(dateStr, 14, 22);

    const tableHead = kolom.map((k) => k.label);
    const tableRows = filteredData.map((row, index) => [
      index + 1,
      toTitleCase(row.nama),
      toTitleCase(row.jenis),
      row.jumlah_hadir || "-",
      row.jumlah_izin || "-",
      row.jumlah_sakit || "-",
      row.jumlah_alpha || "-",
      row.jumlah_lembur === null ? "-" : formatTerlambat(row.jumlah_lembur),
      row.dinas_luar === null ? "-" : formatTerlambat(row.dinas_luar),
      row.total_jam_kerja === null ? "-" : formatTerlambat(row.total_jam_kerja),
      row.total_jam_kerja_normal === null
        ? "-"
        : formatTerlambat(row.total_jam_kerja_normal),
      row.total_jam_terlambat === null
        ? "-"
        : formatTerlambat(row.total_jam_terlambat),
      row.total_jam_kurang === null
        ? "-"
        : formatTerlambat(row.total_jam_kurang),
    ]);

    doc.autoTable({
      head: [tableHead],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: {
        fillColor: [139, 0, 0],
        textColor: [255, 255, 255],
        valign: "middle", // biarkan valign tetap
        // tidak set halign di sini, karena akan diatur per kolom lewat columnStyles
      },
      columnStyles: {
        0: { halign: "center" }, // No
        1: { halign: "left" }, // Nama Pegawai
        2: { halign: "left" }, // Jenis Pegawai
        3: { halign: "center" }, // Hadir
        4: { halign: "center" }, // Izin
        5: { halign: "center" }, // Sakit
        6: { halign: "center" }, // Alpha
        7: { halign: "center" }, // 1/2 Hari
        8: { halign: "left" }, // Kerja
        9: { halign: "center" }, // Normal
        10: { halign: "left" }, // Terlambat
        11: { halign: "left" }, // Bolos
      },
    });

    doc.save(`${getFileName()}.pdf`);
  };

  const handleOpenModal = (id_karyawan, nama) => {
    setOpenModal(true);
    setSelectedNama(nama);
    setDetailLoading(true);
    const token = localStorage.getItem("token");

    // Format tanggal ke dd-mm-yyyy
    const formatToDDMMYYYY = (str) => {
      const [year, month, day] = str.split("-");
      return `${day}-${month}-${year}`;
    };

    const formattedStart = formatToDDMMYYYY();
    const formattedEnd = formatToDDMMYYYY();

    api
      .get("/rekapan/absensi/detail", {
        params: {
          id_karyawan,
        },
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setDetailData(res.data.data || []);
        setDetailLoading(false);
      })
      .catch(() => {
        setDetailData([]);
        setDetailLoading(false);
      });
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setDetailData([]);
    setSelectedNama("");
  };

  const detail =
    currentRows.length === 0 ? (
      <TableRow>
        <TableCell colSpan={kolom.length} align="center">
          Tidak ada yang cocok dengan pencarian Anda.
        </TableCell>
      </TableRow>
    ) : (
      currentRows.map((item, index) => (
        <TableRow key={index}>
          <TableCell>{indexOfFirstRow + index + 1}</TableCell>
          <TableCell className="capitalize">{item.nama}</TableCell>
          <TableCell className="capitalize">{item.jenis}</TableCell>
          <TableCell align="left">
            {item.jumlah_hadir === "0" || !item.jumlah_hadir
              ? "-"
              : item.jumlah_hadir}
          </TableCell>
          <TableCell align="left">
            {item.jumlah_izin === "0" || !item.jumlah_izin
              ? "-"
              : item.jumlah_izin}
          </TableCell>
          <TableCell align="left">
            {item.jumlah_sakit === "0" || !item.jumlah_sakit
              ? "-"
              : item.jumlah_sakit}
          </TableCell>
          <TableCell align="left">
            {item.jumlah_alpha === "0" || !item.jumlah_alpha
              ? "-"
              : item.jumlah_alpha}
          </TableCell>
          <TableCell align="left">
            {item.jumlah_lembur === "0" || !item.jumlah_lembur
              ? "-"
              : item.jumlah_lembur}
          </TableCell>
          <TableCell align="left">
            {item.di === "0" || !item.dinas_luar ? "-" : item.dinas_luar}
          </TableCell>
          <TableCell align="left">
            {item.total_jam_kerja === "0" || !item.total_jam_kerja
              ? "-"
              : item.total_jam_kerja}
          </TableCell>
          <TableCell align="left">
            {item.total_jam_kerja_normal === "0" || !item.total_jam_kerja_normal
              ? "-"
              : item.total_jam_kerja_normal}
          </TableCell>

          <TableCell align="left">
            {item.total_jam_terlambat === "0" || !item.total_jam_terlambat
              ? "-"
              : item.total_jam_terlambat}
          </TableCell>
          <TableCell align="left">
            {item.total_jam_kurang === "0" || !item.total_jam_kurang
              ? "-"
              : item.total_jam_kurang}
          </TableCell>
          <TableCell align="center">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white px-2 py-0.5 rounded-[10px] text-xs"
              onClick={() => handleOpenModal(item.id_karyawan, item.nama)}
            >
              Detail
            </button>
          </TableCell>
        </TableRow>
      ))
    );

  return (
    <div className="Rekapan">
      <div className="flex">
        <div className="w-full h-full">
          <div className="title flex text-2xl pt-4 pl-4 font-bold">
            Rekapan Presensi
          </div>
          <div className="tabel rounded-[20px] mt-2 mr-4 ml-4 px-2 shadow-md bg-white w-full h-full">
            <div className="ml-2 mb-6 pt-4 flex items-start justify-start gap-4 flex-wrap">
              <div className="flex flex-col">
                <span className="text-sm font-semibold">
                  Detail Rekapan Absensi Pegawai Berkah Angsana
                </span>
                <div className="flex gap-2 mt-2">
                  <div className="flex items-center text-sm gap-2">
                    <label htmlFor="bulan">Bulan:</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="px-2 py-1 border rounded-[20px] text-sm"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(0, i).toLocaleString("id-ID", {
                            month: "long",
                          })}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center text-sm gap-2">
                    <label htmlFor="tahun">Tahun:</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="px-2 py-1 border rounded-[20px] text-sm"
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
                  </div>

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
                  <TableContainer sx={{ maxHeight: 300, maxWidth: 900 }}>
                    <Table stickyHeader>
                      <TableHead className="bg-[#e8ebea]">
                        <TableRow sx={{ height: "36px" }}>
                          {kolom.map((column, index) => (
                            <TableCell
                              key={column.id}
                              onClick={() =>
                                column.id !== "action" && handleSort(column.id)
                              }
                              style={{
                                minWidth: column.minWidth,
                                backgroundColor: "#4d4d4d",
                                color: "white",
                                fontWeight: "bold",
                                fontSize: "12px",
                                padding: "6px",
                                cursor:
                                  column.id !== "action"
                                    ? "pointer"
                                    : "default",
                                whiteSpace: "nowrap",
                                textAlign: "center",
                                borderRadius: index === 13 ? "0 10px 0 0" : "0",
                                border: "1px solid #4d4d4d",
                                boxSizing: "border-box",
                              }}
                            >
                              {column.label}
                              {sortConfig.key === column.id &&
                                column.id !== "action" && (
                                  <span style={{ marginLeft: 4 }}>
                                    {sortConfig.direction === "asc"
                                      ? " ▲"
                                      : " ▼"}
                                  </span>
                                )}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {currentRows.length === 0 ? (
                          <TableRow sx={{ height: "32px" }}>
                            <TableCell
                              colSpan={kolom.length}
                              align="left"
                              sx={{ fontSize: "12px", padding: "6px" }}
                            >
                              Tidak ada yang cocok dengan pencarian Anda.
                            </TableCell>
                          </TableRow>
                        ) : (
                          currentRows.map((item, index) => (
                            <TableRow key={index} sx={{ height: "32px" }}>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "6px" }}
                              >
                                {index + 1}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "6px" }}
                                className="capitalize"
                              >
                                {item.nama}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "6px" }}
                                className="capitalize"
                              >
                                {item.jenis}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "6px" }}
                                align="center"
                              >
                                {item.jumlah_hadir || "-"}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "6px" }}
                                align="center"
                              >
                                {item.jumlah_izin || "-"}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "6px" }}
                                align="center"
                              >
                                {item.jumlah_sakit || "-"}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "6px" }}
                                align="center"
                              >
                                {item.jumlah_alpha || "-"}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "6px" }}
                                align="center"
                              >
                                {item.jumlah_lembur || "-"}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="center"
                              >
                                {item.dinas_luar || "-"}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "6px" }}
                                align="left"
                              >
                                {formatTerlambat(item.total_jam_kerja) || "-"}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "6px" }}
                                align="left"
                              >
                                {formatTerlambat(item.total_jam_kerja_normal) ||
                                  "-"}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "6px" }}
                                align="left"
                              >
                                {formatTerlambat(item.total_jam_terlambat)}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "6px" }}
                                align="left"
                              >
                                {formatTerlambat(item.total_jam_kurang) || "-"}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "6px" }}
                                align="center"
                              >
                                <button
                                  className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded-[10px] text-xs"
                                  onClick={() =>
                                    handleOpenModal(item.id_karyawan, item.nama)
                                  }
                                >
                                  Detail
                                </button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </div>

              <div className="flex justify-between items-center mt-2 px-4">
                <span className="text-sm text-gray-500">
                  Showing {indexOfFirstRow + 1}-
                  {Math.min(indexOfLastRow, absen.length)} of {absen.length}
                </span>
                <div className="flex items-center pb-3 px-4">
                  <button
                    type="button"
                    className="bg-gray-300 text-gray-700 hover:bg-gray-400 focus:ring-4 focus:ring-gray-200 font-medium rounded-l-[20px] text-[10px] px-2 py-1 border border-black"
                    onClick={prevPage}
                    disabled={currentPage === 1}
                  >
                    <GrFormPrevious />
                  </button>
                  <button
                    type="button"
                    className="bg-gray-300 text-gray-700 hover:bg-gray-400 focus:ring-4 focus:ring-gray-200 font-medium rounded-r-[20px] text-[10px] px-2 py-1 border border-black"
                    onClick={nextPage}
                    disabled={
                      currentPage === Math.ceil(absen.length / rowsPerPage)
                    }
                  >
                    <GrFormNext />
                  </button>
                </div>
              </div>

              {/* Move buttons below pagination */}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Detail */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 1000,
            bgcolor: "background.paper",
            borderRadius: 5,
            boxShadow: 24,
            p: 3,
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          {/* Bagian Header Nama dan Tombol Tutup */}
          <div className="mb-2 flex justify-between items-center sticky top-0 bg-white p-2 z-10">
            <span className="font-bold text-lg capitalize">{selectedNama}</span>
            <button
              onClick={handleCloseModal}
              className="text-gray-500 p-1 rounded-full hover:bg-gray-200"
              style={{ fontSize: "1.5rem", lineHeight: 0 }}
            >
              <MdClose />
            </button>
          </div>

          {/* Konten Tabel yang Dapat Di-scroll */}
          {detailLoading ? (
            <div>Loading...</div>
          ) : detailData.length === 0 ? (
            <div>Tidak ada data detail.</div>
          ) : (
            <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
              <Table size="small">
                <TableHead
                  sx={{
                    position: "sticky",
                    top: 0,
                    backgroundColor: "white",
                    zIndex: 1,
                  }}
                >
                  <TableRow>
                    <TableCell>Tanggal</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Jam Masuk</TableCell>
                    <TableCell>Jam Pulang</TableCell>
                    <TableCell>Lokasi Masuk</TableCell>
                    <TableCell>Lokasi Pulang</TableCell>
                    <TableCell>Keterangan</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody className="capitalize">
                  {detailData.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row.tanggal || "-"}</TableCell>
                      <TableCell
                        style={{
                          color:
                            row.nama_status === "Tidak Hadir"
                              ? "red"
                              : row.nama_status === "Hadir"
                              ? "green"
                              : row.nama_status === "Izin"
                              ? "blue"
                              : row.nama_status === "Sakit"
                              ? "#d4a328"
                              : "black",
                        }}
                      >
                        {row.nama_status || "-"}
                      </TableCell>
                      <TableCell>{row.jam_masuk?.slice(0, 5) || "-"}</TableCell>
                      <TableCell>
                        {row.jam_keluar?.slice(0, 5) || "-"}
                      </TableCell>

                      <TableCell>{row.lokasi_masuk || "-"}</TableCell>
                      <TableCell
                        style={{
                          color: ["Setengah hari"].includes(row.lokasi_keluar)
                            ? "#d4a328"
                            : "black",
                        }}
                      >
                        {row.lokasi_keluar || "-"}
                      </TableCell>
                      <TableCell
                        style={{
                          color: ["libur nasional", "minggu"].includes(
                            row.status_hari
                          )
                            ? "red"
                            : "black",
                        }}
                      >
                        {row.status_hari || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default Rekapan;
