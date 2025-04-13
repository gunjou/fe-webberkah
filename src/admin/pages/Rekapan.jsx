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

const kolom = [
  { id: "no", label: "No", minWidth: 30 },
  { id: "nama", label: "Nama Pegawai", minWidth: 80 },
  { id: "jenis", label: "Status", minWidth: 60 },
  { id: "jumlah_hadir", label: "Hadir", minWidth: 40 },
  { id: "jumlah_izin", label: "Izin", minWidth: 40 },
  { id: "jumlah_sakit", label: "Sakit", minWidth: 40 },
  { id: "jumlah_alpha", label: "Alpha", minWidth: 40 },
  { id: "jumlah_setengah_hari", label: "½ Hari", minWidth: 60 },
  { id: "total_jam_kerja", label: "Kerja", minWidth: 60 },
  { id: "total_jam_kerja_normal", label: "Normal", minWidth: 60 },
  { id: "total_jam_terlambat", label: "Terlambat", minWidth: 60 },
  { id: "total_jam_kurang", label: "Bolos", minWidth: 60 },
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
  const rowsPerPage = 25;
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = (start = "", end = "") => {
    const token = localStorage.getItem("token");
    if (!start || !end) return;

    api
      .get(`/rekapan/absensi?start=${start}&end=${end}`, {
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
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const format = (date) =>
      `${String(date.getDate()).padStart(2, "0")}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${date.getFullYear()}`;

    const start = format(firstDay);
    const end = format(lastDay);

    setStartDate(start.split("-").reverse().join("-")); // untuk input type date
    setEndDate(end.split("-").reverse().join("-"));

    fetchData(start, end);
  }, []);

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

  const downloadExcel = () => {
    const confirmDownload = window.confirm(
      "Apakah Anda yakin ingin mengunduh data sebagai file Excel?"
    );
    if (!confirmDownload) return;

    const header = kolom.map((k) => k.label);
    const rows = filteredData.map((item, indeks) => [
      indeks + 1,
      item.nama || "-",
      item.jenis || "-",
      item.jumlah_hadir || "-",
      item.jumlah_izin || "-",
      item.jumlah_sakit || "-",
      item.jumlah_alpha || "-",
      item.jumlah_setengah_hari || "-",
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
    XLSX.writeFile(
      workbook,
      `rekapan_presensi_${startDate}_sampai_${endDate}.xlsx`
    );
  };

  const downloadPDF = () => {
    const confirmDownload = window.confirm(
      "Apakah Anda yakin ingin mengunduh data sebagai file PDF?"
    );
    if (!confirmDownload) return;

    const doc = new jsPDF();
    const title = "Rekapan Presensi";
    const dateStr = `${startDate} Sampai ${endDate}`;

    doc.text(title, 14, 15);
    doc.text(dateStr, 14, 22);

    const tableHead = kolom.map((k) => k.label);
    const tableRows = filteredData.map((row, index) => [
      index + 1,
      row.nama || "-",
      row.jenis || "-",
      row.jumlah_hadir || "-",
      row.jumlah_izin || "-",
      row.jumlah_sakit || "-",
      row.jumlah_alpha || "-",
      row.jumlah_setengah_hari === null
        ? "-"
        : formatTerlambat(row.jumlah_setengah_hari),
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
        halign: "center",
        valign: "middle",
      },
    });

    doc.save(`rekapan_presensi_${startDate}_sampai_${endDate}.pdf`);
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
          <TableCell>{index + 1}</TableCell>
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
            {item.jumlah_setengah_hari === "0" || !item.jumlah_setengah_hari
              ? "-"
              : item.jumlah_setengah_hari}
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
                  Detail Rekapan Presensi Pegawai Berkah Angsana
                </span>
                <div className="flex gap-2 mt-2">
                  <div className="flex items-center text-sm gap-1">
                    <label htmlFor="startDate">Dari:</label>
                    <input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="border rounded-[20px] px-2 py-1 text-sm"
                    />
                  </div>
                  <div className="flex items-center text-sm gap-1">
                    <label htmlFor="endDate">Sampai:</label>
                    <input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="border rounded-[20px] px-2 py-1 text-sm"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const formatDate = (str) => {
                        const [year, month, day] = str.split("-");
                        return `${day}-${month}-${year}`;
                      };
                      fetchData(formatDate(startDate), formatDate(endDate));
                    }}
                    className="bg-custom-merah hover:bg-red-700 text-white text-[12px] rounded-[20px] px-4 py-2"
                  >
                    Tampilkan
                  </button>
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
                  <TableContainer sx={{ maxHeight: 300 }}>
                    <Table stickyHeader>
                      <TableHead className="bg-[#e8ebea]">
                        <TableRow sx={{ height: "36px" }}>
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
                                padding: "6px 12px",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                textAlign: "left",
                                borderRadius: index === 11 ? "0 10px 0 0" : "0",
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
                                align="left"
                              >
                                {item.jumlah_hadir || "-"}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "6px" }}
                                align="left"
                              >
                                {item.jumlah_izin || "-"}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "6px" }}
                                align="left"
                              >
                                {item.jumlah_sakit || "-"}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "6px" }}
                                align="left"
                              >
                                {item.jumlah_alpha || "-"}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "6px" }}
                                align="left"
                              >
                                {item.jumlah_setengah_hari || "-"}
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
                    className="bg-gray-300 text-gray-700 hover:bg-gray-400 rounded-l-[20px] text-xs px-4 py-2 border border-black"
                    onClick={prevPage}
                    disabled={currentPage === 1}
                  >
                    <GrFormPrevious />
                  </button>
                  <button
                    type="button"
                    className="bg-gray-300 text-gray-700 hover:bg-gray-400 rounded-r-[20px] text-xs px-4 py-2 border border-black"
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
    </div>
  );
};

export default Rekapan;
