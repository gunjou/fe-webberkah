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
  { id: "no", label: "No", minWidth: 20 },
  { id: "nama", label: "Nama", minWidth: 40 },
  { id: "tipe", label: "Status", minWidth: 20 },
  { id: "jumlah_hadir", label: "Hadir", minWidth: 20 },
  { id: "jumlah_izin", label: "Izin", minWidth: 20 },
  { id: "jumlah_sakit", label: "Sakit", minWidth: 20 },
  { id: "jumlah_alpha", label: "Alpha", minWidth: 20 },
  { id: "jumlah_setengah_hari", label: "½Hari", minWidth: 20 },
  { id: "dinas_luar", label: "Dinas", minWidth: 40 },
  { id: "total_jam_kerja", label: "Kerja", minWidth: 40 },
  { id: "total_jam_kerja_normal", label: "Normal", minWidth: 40 },
  // { id: "total_jam_terlambat", label: "Terlambat", minWidth: 40 },
  { id: "total_jam_kurang", label: "Jam Kurang", minWidth: 40 },
  { id: "gaji_kotor", label: "Kotor", minWidth: 50 },
  { id: "potongan", label: "potongan", minWidth: 40 },
  { id: "gaji_bersih", label: "Bersih", minWidth: 50 },
  // { id: "hari_dibayar", label: "Bayar", minWidth: 20 },
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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = (start = "", end = "") => {
    const token = localStorage.getItem("token");
    if (!start || !end) return;

    api
      .get("/perhitungan-gaji/", {
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

  const totalGaji = absen.reduce(
    (acc, item) => {
      if (item.tipe === "pegawai tetap") {
        acc.tetap += item.gaji_bersih;
      } else if (item.tipe === "pegawai tidak tetap") {
        acc.tidaktetap += item.gaji_bersih;
      }
      acc.total += item.gaji_bersih;
      return acc;
    },
    { tetap: 0, tidaktetap: 0, total: 0 }
  );

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

  // const getFormattedDate = () => {
  //   const date = new Date();
  //   return new Intl.DateTimeFormat("id-ID", {
  //     weekday: "long",
  //     day: "numeric",
  //     month: "long",
  //     year: "numeric",
  //     timeZone: "Asia/Makassar",
  //   }).format(date);
  // };

  const formatTanggalSlash = (dateStr) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const getDateLabel = (startDate, endDate) => {
    const [startYear, startMonth, startDay] = startDate.split("-");
    const [endYear, endMonth, endDay] = endDate.split("-");
    const bulan = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    const sameMonth = startMonth === endMonth && startYear === endYear;

    const isFullMonth =
      startDay === "01" &&
      endDay ===
        new Date(endYear, parseInt(endMonth), 0)
          .getDate()
          .toString()
          .padStart(2, "0");

    if (sameMonth && isFullMonth) {
      return `Bulan ${bulan[parseInt(startMonth, 10) - 1]} ${startYear}`;
    } else {
      return `${formatTanggalSlash(startDate)} - ${formatTanggalSlash(
        endDate
      )}`;
    }
  };

  const getFileName = (startDate, endDate) => {
    const [startYear, startMonth, startDay] = startDate.split("-");
    const [endYear, endMonth, endDay] = endDate.split("-");
    const bulan = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    // Cek apakah berada di bulan dan tahun yang sama
    const sameMonth = startMonth === endMonth && startYear === endYear;
    // Cek apakah range mencakup keseluruhan bulan (1 sampai tanggal terakhir)
    const isFullMonth =
      startDay === "01" &&
      endDay ===
        new Date(endYear, parseInt(endMonth), 0)
          .getDate()
          .toString()
          .padStart(2, "0");

    if (sameMonth && isFullMonth) {
      return `Rekapan Gaji Bulan ${bulan[parseInt(startMonth) - 1]}`;
    } else {
      return `Rekapan Gaji ${startDay}-${startMonth}-${startYear} sampai ${endDay}-${endMonth}-${endYear}`;
    }
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

    const header = kolom.map((k) => k.label);
    const rows = filteredData.map((item, indeks) => [
      indeks + 1,
      toTitleCase(item.nama),
      toTitleCase(item.tipe),
      item.jumlah_hadir || "-",
      item.jumlah_izin || "-",
      item.jumlah_sakit || "-",
      item.jumlah_alpha || "-",
      item.jumlah_setengah_hari || "-",
      item.dinas_luar || "-",
      item.total_jam_kerja === null
        ? "-"
        : formatTerlambat(item.total_jam_kerja),
      item.total_jam_kerja_normal === null
        ? "-"
        : formatTerlambat(item.total_jam_kerja_normal),
      item.total_jam_terlambat === null
        ? //   ? "-"
          //   : formatTerlambat(item.total_jam_terlambat),
          // item.total_jam_kurang === null
          "-"
        : formatTerlambat(item.total_jam_kurang),
      formatRupiah(item.gaji_kotor) || "-",
      formatRupiah(item.potongan) || "-",
      formatRupiah(item.gaji_bersih) || "-",
      // item.hari_dibayar || "-",
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekapan Presensi");
    XLSX.writeFile(workbook, `${getFileName(startDate, endDate)}.xlsx`);
  };

  const downloadPDF = () => {
    const confirmDownload = window.confirm(
      "Apakah Anda yakin ingin mengunduh data sebagai file PDF?"
    );
    if (!confirmDownload) return;

    const doc = new jsPDF({ orientation: "landscape" });

    const title = "Rekapan Presensi";
    const dateStr = getDateLabel(startDate, endDate);

    doc.setFontSize(14);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.text(dateStr, 14, 22);

    const tableHead = kolom.map((k) => k.label);
    const tableRows = filteredData.map((row, index) => [
      index + 1,
      toTitleCase(row.nama),
      toTitleCase(row.tipe),
      row.jumlah_hadir || "-",
      row.jumlah_izin || "-",
      row.jumlah_sakit || "-",
      row.jumlah_alpha || "-",
      row.jumlah_setengah_hari === null
        ? "-"
        : formatTerlambat(row.jumlah_setengah_hari),
      row.dinas_luar || "-",
      row.total_jam_kerja === null ? "-" : formatTerlambat(row.total_jam_kerja),
      row.total_jam_kerja_normal === null
        ? "-"
        : formatTerlambat(row.total_jam_kerja_normal),
      row.total_jam_terlambat === null
        ? //   ? "-"
          //   : formatTerlambat(row.total_jam_terlambat),
          // row.total_jam_kurang === null
          "-"
        : formatTerlambat(row.total_jam_kurang),
      formatRupiah(row.gaji_kotor) || "-",
      formatRupiah(row.potongan) || "-",
      formatRupiah(row.gaji_bersih) || "-",
      // row.hari_dibayar || "-",
    ]);

    doc.autoTable({
      head: [tableHead],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: {
        fillColor: [139, 0, 0],
        textColor: [255, 255, 255],
        valign: "middle",
        // halign: "center",
      },
      columnStyles: {
        0: { halign: "center" }, // No
        1: { halign: "left" }, // Nama
        2: { halign: "left" }, // Jenis
        3: { halign: "center" }, // Hadir
        4: { halign: "center" }, // Izin
        5: { halign: "center" }, // Sakit
        6: { halign: "center" }, // Alpha
        7: { halign: "center" }, // 1/2 Hari
        8: { halign: "center" }, // Dinas
        9: { halign: "left" }, // Kerja
        10: { halign: "center" }, // Normal
        11: { halign: "left" }, // Terlambat
        12: { halign: "left" }, // Bolos
      },
    });

    let y = doc.lastAutoTable.finalY + 14; // Ambil posisi Y terakhir tabel, lalu tambahkan spasi

    const labels = [
      "Total Gaji Pegawai Tetap",
      "Total Gaji Pegawai Tidak Tetap",
      "Total Gaji Semua Pegawai",
    ];

    const values = [
      formatRupiah(totalGaji.tetap),
      formatRupiah(totalGaji.tidaktetap),
      formatRupiah(totalGaji.total),
    ];

    labels.forEach((label, index) => {
      doc.setFont("helvetica", "normal");
      doc.text(label, 14, y + index * 6);
      doc.setFont("helvetica", "bold");
      doc.text(`: ${values[index]}`, 75, y + index * 6); // Geser nilai agar rata ke kanan
    });

    doc.save(`${getFileName(startDate, endDate)}.pdf`);
  };

  currentRows.length === 0 ? (
    <TableRow>
      <TableCell colSpan={kolom.length} align="center">
        Tidak ada yang cocok dengan pencarian Anda.
      </TableCell>
    </TableRow>
  ) : (
    currentRows.map((item, index) => (
      <TableRow key={index}>
        <TableCell align="center">{indexOfFirstRow + index + 1}</TableCell>
        <TableCell className="capitalize">{item.nama}</TableCell>
        <TableCell className="capitalize">{item.tipe}</TableCell>
        <TableCell align="center">
          {item.jumlah_hadir === "0" || !item.jumlah_hadir
            ? "-"
            : item.jumlah_hadir}
        </TableCell>
        <TableCell align="center">
          {item.jumlah_izin === "0" || !item.jumlah_izin
            ? "-"
            : item.jumlah_izin}
        </TableCell>
        <TableCell align="center">
          {item.jumlah_sakit === "0" || !item.jumlah_sakit
            ? "-"
            : item.jumlah_sakit}
        </TableCell>
        <TableCell align="center">
          {item.jumlah_alpha === "0" || !item.jumlah_alpha
            ? "-"
            : item.jumlah_alpha}
        </TableCell>
        <TableCell align="center">
          {item.jumlah_setengah_hari === "0" || !item.jumlah_setengah_hari
            ? "-"
            : item.jumlah_setengah_hari}
        </TableCell>
        <TableCell align="left">
          {item.dinas_luar === "0" || !item.dinas_luar ? "-" : item.dinas_luar}
        </TableCell>
        <TableCell align="left">
          {item.total_jam_kerja === "0" || !item.total_jam_kerja
            ? "-"
            : item.total_jam_kerja}
        </TableCell>
        <TableCell align="center">
          {item.total_jam_kerja_normal === "0" || !item.total_jam_kerja_normal
            ? "-"
            : item.total_jam_kerja_normal}
        </TableCell>

        {/* <TableCell align="left">
          {item.total_jam_terlambat === "0" || !item.total_jam_terlambat
            ? "-"
            : item.total_jam_terlambat}
        </TableCell> */}
        <TableCell align="left">
          {item.total_jam_kurang === "0" || !item.total_jam_kurang
            ? "-"
            : item.total_jam_kurang}
        </TableCell>
        <TableCell align="left">
          {item.gaji_kotor === "0" || !item.gaji_kotor ? "-" : item.gaji_kotor}
        </TableCell>
        <TableCell align="left">
          {item.potongan === "0" || !item.potongan
            ? "-"
            : formatRupiah(item.potongan)}
        </TableCell>
        <TableCell align="left">
          {item.gaji_bersih === "0" || !item.gaji_bersih
            ? "-"
            : formatRupiah(item.gaji_bersih)}
        </TableCell>
        {/* <TableCell align="center">
          {item.hari_dibayar === "0" || !item.hari_dibayar
            ? "-"
            : item.hari_dibayar}
        </TableCell> */}
      </TableRow>
    ))
  );

  return (
    <div className="Perhitungan Gaji">
      <div className="flex">
        <div className="w-full h-full">
          <div className="title flex text-2xl pt-4 pl-4 font-bold">
            Perhitungan Gaji
          </div>
          <div className="tabel rounded-[20px] mt-2 mr-4 ml-4 px-2 shadow-md bg-white w-full h-full">
            <div className="ml-2 mb-6 pt-4 flex items-start justify-start gap-4 flex-wrap">
              <div className="flex flex-col">
                <span className="text-sm font-semibold">
                  Detail Gaji Pegawai Berkah Angsana
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
                                borderRadius: index === 16 ? "0 10px 0 0" : "0",
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
                                {item.jumlah_hadir || "-"}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="center"
                              >
                                {item.jumlah_izin || "-"}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="center"
                              >
                                {item.jumlah_sakit || "-"}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="center"
                              >
                                {item.jumlah_alpha || "-"}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="center"
                              >
                                {item.jumlah_setengah_hari || "-"}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="center"
                              >
                                {item.dinas_luar || "-"}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="left"
                              >
                                {formatTerlambat(item.total_jam_kerja) || "-"}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="center"
                              >
                                {formatTerlambat(item.total_jam_kerja_normal) ||
                                  "-"}
                              </TableCell>
                              {/* <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="left"
                              >
                                {formatTerlambat(item.total_jam_terlambat)}
                              </TableCell> */}
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="left"
                              >
                                {formatTerlambat(item.total_jam_kurang) || "-"}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="left"
                              >
                                {formatRupiah(item.gaji_kotor) || "-"}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="left"
                              >
                                {formatRupiah(item.potongan) || "-"}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="left"
                              >
                                {formatRupiah(item.gaji_bersih) || "-"}
                              </TableCell>
                              {/* <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="left"
                              >
                                {item.hari_dibayar || "-"}
                              </TableCell> */}
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
    </div>
  );
};

export default PerhitunganGaji;
