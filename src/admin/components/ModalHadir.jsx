import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Paper from "@mui/material/Paper";
import { DataGrid } from "@mui/x-data-grid";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import { IoClose, IoTrashBin } from "react-icons/io5";
import api from "../../shared/Api";

import { BiSolidEdit } from "react-icons/bi";

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
    width: 50,
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
    field: "jam_terlambat",
    headerName: "Waktu Terlambat",
    width: 160,
    headerAlign: "center",
    align: "center",
    renderCell: (params) => {
      const value = params.value;
      if (value == null)
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
  const [editData, setEditData] = useState(null);
  const [lokasiList, setLokasiList] = useState([]);

  useEffect(() => {
    if (open) {
      setFilteredData(data);
      setSearchTerm("");
    }
  }, [open, data]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    api
      .get("/absensi/hadir", {
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

    api
      .get("/lokasi", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setLokasiList(res.data.lokasi))
      .catch((err) => console.error("Gagal mengambil lokasi:", err));
  }, []);

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = data.filter((item) =>
      item.nama.toLowerCase().includes(value)
    );
    setFilteredData(filtered);
  };

  const handleDelete = (id) => {
    if (window.confirm("Yakin ingin menghapus data ini?")) {
      const token = localStorage.getItem("token");
      api
        .delete(`/absensi/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          const updated = data.filter((d) => d.id !== id);
          setData(updated);
          setFilteredData(updated);
        })
        .catch((err) => console.error("Gagal menghapus:", err));
    }
  };

  const handleEdit = (row) => {
    setEditData(row);
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

  const downloadPDF = () => {
    const confirmDownload = window.confirm(
      "Apakah Anda yakin ingin mengunduh data sebagai file PDF?"
    );
    if (!confirmDownload) return;

    const doc = new jsPDF();
    const title = "Rekapan Presensi";
    const dateStr = getFormattedDate();

    doc.text(title, 14, 15);
    doc.text(dateStr, 14, 22);

    const tableColumn = [
      "No",
      "Nama",
      "Check In",
      "Check Out",
      "Lokasi In",
      "Lokasi Out",
      "Terlambat",
      "Status",
    ];

    const tableRows = data.map((row, index) => {
      const waktuTerlambat = row.jam_terlambat
        ? row.jam_terlambat === null
          ? "Tepat Waktu"
          : `${Math.floor(row.jam_terlambat / 60)} jam ${
              row.jam_terlambat % 60
            } menit`
        : "-";

      return [
        index + 1,
        row.nama,
        row.jam_masuk || "-",
        row.jam_keluar || "-",
        row.lokasi_masuk || "-",
        row.lokasi_keluar || "-",
        waktuTerlambat,
        row.status_absen || "-",
      ];
    });

    doc.autoTable({
      head: [tableColumn],
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

    doc.save("rekapan_presensi.pdf");
  };

  const columns = [
    {
      field: "no",
      headerName: "No",
      width: 50,
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
            (txt) =>
              txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
          );
        return toTitleCase(params.value);
      },
    },
    { field: "jam_masuk", headerName: "Check In", width: 130 },
    {
      field: "jam_keluar",
      headerName: "Check Out",
      width: 130,
      renderCell: (params) => params.value || "-",
    },
    { field: "lokasi_masuk", headerName: "Lokasi In", width: 150 },
    {
      field: "lokasi_keluar",
      headerName: "Lokasi Check out",
      width: 150,
      headerAlign: "center",
      align: "left",
      renderCell: (params) => <span>{params.value || "-"}</span>,
    },
    {
      field: "jam_terlambat",
      headerName: "Terlambat",
      width: 160,
      renderCell: (params) => {
        const value = params.value;
        if (value === null)
          return <span style={{ color: "green" }}>Tepat Waktu</span>;
        const jam = Math.floor(value / 60);
        const menit = value % 60;
        return (
          <span style={{ color: "red" }}>{`${jam} jam ${menit} menit`}</span>
        );
      },
    },
    { field: "status_absen", headerName: "Status", width: 130 },
    {
      field: "action",
      headerName: "Action",
      width: 130,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEdit(params.row)}
            className="flex items-center text-blue-500 hover:text-blue-700"
            title="Edit"
          >
            <BiSolidEdit className="mr-1" />
            Edit
          </button>
          <button
            //onClick={() => handleDelete(params.row.id)}
            className="flex items-center text-red-500 hover:text-red-700"
            title="Delete"
          >
            <IoTrashBin className="mr-1" />
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="ModalHadir">
      <Modal open={open} onClose={close}>
        <Box sx={style}>
          <button className="absolute top-2 right-2" onClick={close}>
            <IoClose size={30} />
          </button>

          <Typography variant="h6" component="h2" className="pb-3">
            List Pegawai Hadir
            <div className="flex justify-between items-center text-sm">
              <span>{getFormattedDate()}</span>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                className="border rounded-[20px] px-3 py-1 w-80"
                placeholder="Cari"
              />
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

          <div className="flex justify-end mt-2 space-x-2">
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
        </Box>
      </Modal>

      {editData && (
        <Modal open={true} onClose={() => setEditData(null)}>
          <Box sx={{ ...style, width: 400 }}>
            <Typography variant="h6" mb={2}>
              Edit Data Presensi
            </Typography>
            <div className="space-y-3">
              <div>
                <label className="text-sm">Jam Masuk</label>
                <input
                  type="text"
                  className="w-full border p-2 rounded"
                  value={editData.jam_masuk}
                  onChange={(e) =>
                    setEditData({ ...editData, jam_masuk: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm">Jam Keluar</label>
                <input
                  type="text"
                  className="w-full border p-2 rounded"
                  value={editData.jam_keluar || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, jam_keluar: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setEditData(null)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const token = localStorage.getItem("token");
                  api
                    .put(`/absensi/${editData.id}`, editData, {
                      headers: { Authorization: `Bearer ${token}` },
                    })
                    .then(() => {
                      const updated = data.map((d) =>
                        d.id === editData.id ? editData : d
                      );
                      setData(updated);
                      setFilteredData(updated);
                      setEditData(null);
                      alert("Data berhasil diperbarui!");
                    })
                    .catch((err) => {
                      console.error("Gagal update:", err);
                      alert("Terjadi kesalahan saat menyimpan perubahan.");
                    });
                }}
                className="px-4 py-2 rounded bg-blue-500 text-white"
              >
                Simpan
              </button>
            </div>
          </Box>
        </Modal>
      )}
    </div>
  );
};

export default ModalHadir;
