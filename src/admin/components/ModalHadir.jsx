import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Paper from "@mui/material/Paper";
import { DataGrid } from "@mui/x-data-grid";
import { FaFileExcel } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import api from "../../shared/Api";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 3,
};

const columns = [
  {
    field: "no",
    headerName: "No",
    width: 70,
    headerAlign: "center",
    align: "center",
    headerClassName: "font-bold text-black",
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      const index = params.api.getSortedRowIds().indexOf(params.id);
      return index + 1;
    },
  },
  {
    field: "nama",
    headerName: "Nama",
    width: 160,
    renderCell: (params) => {
      const toTitleCase = (str) =>
        str.replace(
          /\w\S*/g,
          (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
        );
      return toTitleCase(params.value);
    },
  },
  {
    field: "jam_masuk",
    headerName: "Waktu Check in",
    width: 130,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "jam_keluar",
    headerName: "Waktu Check out",
    width: 130,
    headerAlign: "center",
    align: "center",
    renderCell: (params) => params.value || "-",
  },
  {
    field: "lokasi_masuk",
    headerName: "Lokasi Check in",
    width: 150,
    headerAlign: "center",
    align: "left",
  },
  {
    field: "lokasi_keluar",
    headerName: "Lokasi Check out",
    width: 150,
    headerAlign: "center",
    renderCell: (params) => (
      <span
        style={{
          display: "block",
          width: "100%",
          textAlign: params.value ? "left" : "center",
        }}
      >
        {params.value || "-"}
      </span>
    ),
  },
  {
    field: "waktu_terlambat",
    headerName: "Waktu Terlambat",
    width: 160,
    headerAlign: "center",
    align: "center",
    renderCell: (params) => {
      const value = params.value;
      if (value === 0)
        return <span style={{ color: "green" }}>Tepat Waktu</span>;
      const jam = Math.floor(value / 60);
      const menit = value % 60;
      const display = jam > 0 ? `${jam} jam ${menit} menit` : `${menit} menit`;
      return <span style={{ color: "red" }}>{display}</span>;
    },
  },
  {
    field: "status_absen",
    headerName: "Status",
    width: 130,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "action",
    headerName: "Action",
    width: 100,
    headerAlign: "center",
    align: "center",
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

const paginationModel = { page: 0, pageSize: 50 };

const ModalHadir = ({ open, close }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setFilteredData(data);
      setSearchTerm("");
    }
  }, [open, data]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    api
      .get("/absensi", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const filtered = res.data.absensi.filter((item) => item.nama);
        const sorted = filtered.sort((a, b) => {
          const toMinutes = (timeStr) => {
            if (!timeStr) return Infinity;
            const [h, m] = timeStr.split(":").map(Number);
            return h * 60 + m;
          };
          return toMinutes(a.jam_masuk) - toMinutes(b.jam_masuk);
        });
        setData(sorted);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = data.filter((item) =>
      item.nama.toLowerCase().includes(value)
    );
    setFilteredData(filtered);
  };

  const downloadExcel = () => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin mengunduh data sebagai file Excel?"
      )
    ) {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Rekapan Presensi");
      XLSX.writeFile(workbook, "rekapan_presensi.xlsx");
    }
  };

  return (
    <div className="ModalHadir">
      <Modal open={open} onClose={close}>
        <Box sx={style}>
          <button
            type="button"
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            onClick={close}
          >
            <IoClose size={30} />
          </button>

          <Typography variant="h6" component="h2" className="pb-3">
            List Pegawai Hadir
            <div className="flex justify-between items-center text-sm">
              <span>{getFormattedDate()}</span>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  className="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-[20px] w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500"
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

          <Paper sx={{ width: "100%", height: 400, overflow: "auto" }}>
            <DataGrid
              rows={filteredData}
              columns={columns}
              initialState={{ pagination: { paginationModel } }}
              loading={loading}
            />
          </Paper>

          <button
            type="button"
            className="flex items-center text-[12px] bg-green-500 mr-4 mt-4 text-white hover:bg-green-700 rounded-[20px] px-4 py-2"
            onClick={downloadExcel}
          >
            <span className="text-xs pr-2">
              <FaFileExcel />
            </span>
            Unduh Data
          </button>
        </Box>
      </Modal>
    </div>
  );
};

export default ModalHadir;
