import React, { useEffect, useState } from "react";
import axios from "axios";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import * as XLSX from "xlsx";
import { FaFileExcel, FaTimes } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",

  // width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",

  boxShadow: 24,
  p: 3,
};

const columns = [
  {
    field: "id",
    headerName: "No",
    width: 70,
    headerAlign: "center",
    align: "center",
    headerClassName: "font-bold text-black", // Tambahkan class untuk header
  },
  {
    field: "nama",
    headerName: "Nama",
    width: 160,
  },

  {
    field: "jam_masuk",
    headerName: "Waktu Check in",
    width: 130,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "lokasi_masuk",
    headerName: "Lokasi Check in",
    width: 130,
    headerAlign: "center",
    align: "left",
  },
  {
    field: "jam_keluar",
    headerName: "Waktu Check out",
    width: 130,
    headerAlign: "center",
    align: "center",
  },

  {
    field: "lokasi_keluar",
    headerName: "Lokasi Check out",
    width: 130,
    headerAlign: "center",
    align: "left",
    renderCell: (params) => {
      if (params.value === null) {
        return <span>Belum check-out</span>;
      }
      return <span>{params.value}</span>;
    },
  },

  {
    field: "waktu_terlambat",
    headerName: "Waktu Terlambat",
    width: 130,
    headerAlign: "center",
    align: "left",
    renderCell: (params) => {
      if (params.value !== null) {
        return <span style={{ color: "red" }}>{params.value}</span>;
      }
      return <span style={{ color: "green" }}>Tepat Waktu</span>;
    },
  },
];

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
const paginationModel = { page: 0, pageSize: 25 };

const ModalHadir = ({ open, close }) => {
  const [data, setData] = useState([]); // Data asli
  const [absen, setAbsen] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // Data yang difilter
  const [searchTerm, setSearchTerm] = useState(""); // Nilai input pencarian
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setFilteredData(data); // Reset filteredData ke data asli saat modal dibuka
      setSearchTerm(""); // Reset nilai pencarian
    }
  }, [open, data]);

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
        setData(sorted);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  console.log(data);
  // Fungsi untuk menangani perubahan input pencarian
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    // Filter data berdasarkan nama
    const filtered = data.filter((item) =>
      item.nama.toLowerCase().includes(value)
    );
    setFilteredData(filtered);
  };
  // Fungsi untuk mengunduh data sebagai file Excel
  const downloadExcel = () => {
    // Tampilkan konfirmasi kepada pengguna
    const confirmDownload = window.confirm(
      "Apakah Anda yakin ingin mengunduh data sebagai file Excel?"
    );
    if (confirmDownload) {
      // Buat worksheet dari data absen
      const worksheet = XLSX.utils.json_to_sheet(data);
      // Buat workbook dan tambahkan worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Rekapan Presensi");
      // Ekspor file Excel
      XLSX.writeFile(workbook, "rekapan_presensi.xlsx");
    }
  };

  return (
    <div className="ModalHadir">
      {/* Modal Semua Pegawai Hadir */}
      <Modal
        open={open}
        onClose={close}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {/* Tombol silang untuk menutup modal */}
          <button
            type="button"
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={close}
          >
            <IoClose size={30} />
          </button>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            className="pb-3"
          >
            List Pegawai Hadir
            <div className="flex justify-between items-center text-sm">
              <span>{getFormattedDate()}</span>
              <div className="relative">
                <input
                  type="text"
                  id="table-search-users"
                  value={searchTerm} // Bind nilai input dengan state
                  onChange={handleSearch} // Panggil fungsi handleSearch saat input berubah
                  className="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-[20px] w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Search"
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
            </div>
          </Typography>
          <Paper sx={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={filteredData} // Gunakan data yang sudah difilter
              columns={columns}
              initialState={{ pagination: { paginationModel } }}
            />
          </Paper>
          <button
            type="button"
            className="flex items-center text-[12px] bg-green-500 mr-4 mt-4 text-white hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-[20px] px-4 py-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            onClick={downloadExcel}
          >
            <span className="text-xs pr-2">
              <FaFileExcel />
            </span>
            Unduh Data
          </button>
        </Box>
      </Modal>
      {/* End Modal Semua Pegawai Hadir */}
    </div>
  );
};

export default ModalHadir;
