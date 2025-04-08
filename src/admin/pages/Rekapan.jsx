/* eslint-disable jsx-a11y/anchor-is-valid */
import { React, useEffect, useState } from "react";
import { Modal, Label, TextInput, Select } from "flowbite-react";
import { FaFileExcel } from "react-icons/fa";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import axios from "axios";
import * as XLSX from "xlsx"; // Tambahkan impor untuk pustaka xlsx

// import SideMenu from './SideMenu'
// import NavMenu from './NavMenu'

const kolom = [
  { id: "nama", label: "Nama Pegawai", minWidth: 100 },
  {
    id: "jam_masuk",
    label: "Jam Masuk",
    minWidth: 100,
    type: "time",
  },
  {
    id: "lokasi_masuk",
    label: "Lokasi Masuk",
    minWidth: 100,
    type: "varchar",
  },
  {
    id: "jam_keluar",
    label: "Jam Keluar",
    minWidth: 100,
    type: "time",
  },

  {
    id: "lokasi_keluar",
    label: "Lokasi Keluar",
    minWidth: 100,
    type: "varchar",
  },
  {
    id: "waktu_terlambat",
    label: "Waktu Terlambat",
    minWidth: 100,
    type: "time",
  },
];

const Rekapan = () => {
  const [absen, setAbsen] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 25;

  const [searchTerm, setSearchTerm] = useState("");

  // Fetch data from API
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("https://api.berkahangsana.online/absensi", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const sorted = res.data.absensi
          .filter((item) => item.nama) // optional: filter kalau nama tidak null
          .sort((a, b) => a.nama.localeCompare(b.nama));
        setAbsen(sorted);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Filter data berdasarkan search term
  const filteredData = absen
    .filter((item) =>
      item.nama.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aMatches = a.nama
        .toLowerCase()
        .startsWith(searchTerm.toLowerCase());
      const bMatches = b.nama
        .toLowerCase()
        .startsWith(searchTerm.toLowerCase());
      return bMatches - aMatches; // Prioritaskan yang cocok di depan
    });

  // Hitung indeks data yang akan ditampilkan
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = searchTerm
    ? filteredData.slice(0, rowsPerPage) // Tampilkan hanya halaman pertama
    : filteredData.slice(indexOfFirstRow, indexOfLastRow);

  // Fungsi untuk mengganti halaman
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
    const options = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Makassar",
    };
    return new Intl.DateTimeFormat("id-ID", options).format(date);
  };

  var detail = "";
  if (currentRows.length === 0) {
    detail = (
      <TableRow>
        <TableCell colSpan={kolom.length} align="center">
          Tidak ada yang cocok dengan pencarian Anda.
        </TableCell>
      </TableRow>
    );
  } else {
    detail = currentRows.map((item, index) => (
      <TableRow
        key={index}
        sx={{
          "&:last-child td, &:last-child th": { border: 0 },
        }}
      >
        <TableCell component="th" scope="row" className="capitalize">
          {item.nama}
        </TableCell>
        <TableCell align="left">{item.jam_masuk}</TableCell>
        <TableCell align="left">{item.lokasi_masuk}</TableCell>
        <TableCell align="left">{item.jam_keluar}</TableCell>
        <TableCell align="left">
          {item.lokasi_keluar === null ? (
            <span>Belum check-out</span>
          ) : (
            <span>{item.lokasi_keluar}</span>
          )}
        </TableCell>
        <TableCell align="left">
          {item.waktu_terlambat === null ? (
            <span style={{ color: "green", fontWeight: "bold" }}>
              Tepat waktu
            </span>
          ) : (
            <span style={{ color: "red", fontWeight: "bold" }}>
              {item.waktu_terlambat}
            </span>
          )}
        </TableCell>
      </TableRow>
    ));
  }

  // Fungsi untuk mengunduh data sebagai file Excel
  const downloadExcel = () => {
    // Tampilkan konfirmasi kepada pengguna
    const confirmDownload = window.confirm(
      "Apakah Anda yakin ingin mengunduh data sebagai file Excel?"
    );
    if (confirmDownload) {
      // Buat worksheet dari data absen
      const worksheet = XLSX.utils.json_to_sheet(absen);
      // Buat workbook dan tambahkan worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Rekapan Presensi");
      // Ekspor file Excel
      XLSX.writeFile(workbook, "rekapan_presensi.xlsx");
    }
  };

  return (
    <div className="Rekapan ">
      {/* Navbar Sction */}
      {/* <NavMenu /> */}

      <div className="flex">
        {/* Sidebar Section */}
        {/* <SideMenu /> */}

        {/* Table List Pegawai */}
        <div className="w-full h-full">
          <div className="title flex text-2xl pt-4 pl-4 font-bold">
            Rekapan Presensi
          </div>
          <div className="tabel rounded-[20px] mt-4 mr-4 ml-4 px-2 shadow-md bg-white w-full h-full">
            {/* Search box */}
            <div className="ml-2 mb-6 pt-4 flex items-center justify-between">
              <span className="flex text-lg pl-2 font-semibold mr-[300px]">
                {getFormattedDate()}
              </span>
              <div className="relative">
                <input
                  type="text"
                  id="table-search-users"
                  className="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-[20px] w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Search"
                  searchTerm={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </div>
              </div>
              <button
                type="button"
                className="flex items-center text-[12px] bg-green-500 mr-4 text-white hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-[20px] px-4 py-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                onClick={downloadExcel}
              >
                <span className="text-xs pr-2">
                  <FaFileExcel />
                </span>
                Unduh Data
              </button>
            </div>

            {/* end search box */}
            <div className="overflow-x-auto pl-2">
              <div className="bg-white rounded-lg shadow-md mr-2 overflow-y-auto max-h-[300px] ">
                <Paper sx={{ width: "100%", overflow: "hidden" }}>
                  <TableContainer sx={{ maxHeight: 300 }}>
                    <Table stickyHeader aria-label="sticky table">
                      <TableHead className="bg-[#e8ebea]">
                        <TableRow>
                          {kolom.map((column, index) => (
                            <TableCell
                              key={column.id}
                              align={column.align}
                              style={{
                                minWidth: column.minWidth,
                                backgroundColor: "#4d4d4d", // Ganti warna latar belakang
                                color: "white", // Ganti warna teks
                                fontWeight: "bold",
                                borderRadius: index === 0 ? "0 0 10px 0" : "0",
                                borderRadius: index === 5 ? "0 10px 0 0" : "0",
                              }}
                            >
                              {column.label}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody className="text-red">{detail}</TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </div>
              {/* Tombol Next dan Prev dengan keterangan halaman */}
              <div className="flex justify-between items-center mt-4 px-4">
                {/* Keterangan Halaman */}
                <span className="text-sm text-gray-500">
                  Showing {indexOfFirstRow + 1}-
                  {Math.min(indexOfLastRow, absen.length)} of {absen.length}
                </span>

                {/* Tombol Next dan Prev */}
                <div className="flex items-center pb-3 px-4">
                  <button
                    type="button"
                    className="bg-gray-300 text-gray-700 hover:bg-gray-400 focus:ring-4 focus:ring-gray-200 font-medium rounded-l-[20px] text-xs px-4 py-2 border border-black"
                    onClick={prevPage}
                    disabled={currentPage === 1}
                  >
                    <GrFormPrevious />
                  </button>
                  <button
                    type="button"
                    className="bg-gray-300 text-gray-700 hover:bg-gray-400 focus:ring-4 focus:ring-gray-200 font-medium rounded-r-[20px] text-xs px-4 py-2 border border-black"
                    onClick={nextPage}
                    disabled={
                      currentPage === Math.ceil(absen.length / rowsPerPage)
                    }
                  >
                    <GrFormNext />
                  </button>
                </div>
              </div>
            </div>
            {/* End section table */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rekapan;
