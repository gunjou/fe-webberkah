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
import dayjs from "dayjs";

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

const toTitleCase = (str) => {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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

const paginationModel = { page: 0, pageSize: 50 };

const ModalHadir = ({ open, close, type, selectedDate }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState(null);

  const [daftarKaryawan, setDaftarKaryawan] = useState([]);
  useEffect(() => {
    const token = localStorage.getItem("token");

    api
      .get("/pegawai/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const karyawanList = res.data.map((k) => ({
          id: k.id_karyawan,
          nama: toTitleCase(k.nama),
        }));
        setDaftarKaryawan(karyawanList);
      })
      .catch((err) => {
        console.error("Gagal fetch pegawai:", err);
      });
  }, []);

  const [showTambahManual, setShowTambahManual] = useState(false);
  const [formManual, setFormManual] = useState({
    id_karyawan: "",
    jam_masuk: "",
    jam_keluar: "",
    lokasi_masuk: "",
    lokasi_keluar: "",
  });

  const formatDateParam = (dateObj) => {
    return dayjs(dateObj).format("DD-MM-YYYY");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    let endpoint = "";
    let filterData = (data) => data;

    const formattedDate = formatDateParam(selectedDate);

    if (
      type === "hadir" ||
      type === "staff" ||
      type === "pegawai_lapangan" ||
      type === "cleaning_services"
    ) {
      endpoint = `/absensi/hadir?tanggal=${formattedDate}`;
      if (type === "staff")
        filterData = (data) => data.filter((item) => item.id_jenis === 4);
      else if (type === "pegawai_lapangan")
        filterData = (data) => data.filter((item) => item.id_jenis === 5);
      else if (type === "cleaning_services")
        filterData = (data) => data.filter((item) => item.id_jenis === 6);
    } else if (type === "izin_sakit") {
      const token = localStorage.getItem("token");
      const formattedDate = formatDateParam(selectedDate);

      api
        .get(`/absensi/izin-sakit?tanggal=${formattedDate}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const hasil = res.data?.absensi || [];
          const sorted = hasil
            .filter((item) => item.nama)
            .sort((a, b) => (a.nama || "").localeCompare(b.nama || ""));
          setData(sorted);
          setFilteredData(sorted);
        })
        .catch((err) => {
          console.error("Gagal ambil data izin/sakit:", err);
          alert(
            "Gagal ambil data izin/sakit: " +
              (err.response?.data?.message || "Server error.")
          );
          setData([]);
          setFilteredData([]);
        })
        .finally(() => {
          setLoading(false);
        });

      return; // penting: keluar dari useEffect di sini
    } else if (type === "tanpa_keterangan") {
      endpoint = `/absensi/tidak-hadir?tanggal=${formattedDate}`;
    }

    setLoading(true);
    api
      .get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const hasil = filterData(res.data.absensi || []).filter(
          (item) => item.nama
        );
        const sorted = hasil.sort((a, b) => {
          const toMinutes = (timeStr) => {
            if (!timeStr) return Infinity;
            const [h, m] = timeStr.split(":").map(Number);
            return h * 60 + m;
          };
          return toMinutes(a.jam_masuk) - toMinutes(b.jam_masuk);
        });
        setData(sorted);
        setFilteredData(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal fetch data:", err);
        setLoading(false);
      });
  }, [type, selectedDate]);

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

      console.log("Menghapus ID:", id); // debug log

      api
        .delete(`/absensi/delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          const updated = data.filter((d) => d.id_absensi !== id);
          setData(updated);
          setFilteredData(updated);
          alert("Data berhasil dihapus!");
        })
        .catch((err) => {
          console.error("Gagal menghapus:", err);
          alert(
            err.response?.data?.message ||
              "Gagal menghapus: terjadi error di server (500)"
          );
        });
    }
  };

  const handleEdit = (row) => {
    setEditData(row);
  };

  const downloadExcel = () => {
    const dateStr = getFormattedDate();
    if (
      window.confirm(
        "Apakah Anda yakin ingin mengunduh data sebagai file Excel?"
      )
    ) {
      const columnsToExport = getColumns(type)
        .map((col) => col.field)
        .filter((field) => field !== "action");

      const worksheetData = filteredData.map((row, index) => {
        const newRow = {};
        columnsToExport.forEach((field) => {
          if (field === "no") {
            newRow["No"] = index + 1;
          } else if (field === "nama") {
            newRow["Nama"] = toTitleCase(row.nama);
          } else if (field === "jam_terlambat") {
            const val = row.jam_terlambat;
            newRow["Waktu Terlambat"] =
              val == null
                ? "-"
                : `${Math.floor(val / 60)} jam ${val % 60} menit`;
          } else if (field === "jenis_pegawai") {
            const jenisMap = {
              4: "Staff",
              5: "Pegawai Lapangan",
              6: "Pegawi Lapangan",
              7: "Cleaning",
            };
            newRow["Jenis Pegawai"] = jenisMap[row.id_jenis] || "Lainnya"; // Add this line
          } else {
            newRow[
              getColumns(type).find((col) => col.field === field).headerName
            ] = row[field] || "-";
          }
        });
        return newRow;
      });

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Presensi");

      XLSX.writeFile(workbook, `rekapan_presensi_${type}_${dateStr}.xlsx`);
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
    doc.setFontSize(14);
    doc.setFontSize(10);

    const columnsConfig = getColumns(type).filter(
      (col) => col.field !== "action"
    );
    const tableColumn = columnsConfig.map((col) => col.headerName);
    const tableRows = filteredData.map((row, index) => {
      return columnsConfig.map((col) => {
        const field = col.field;
        if (field === "no") return index + 1;
        if (field === "nama") return toTitleCase(row.nama);
        if (field === "jam_terlambat") {
          if (row.jam_terlambat === null) return "-";
          const jam = Math.floor(row.jam_terlambat / 60);
          const menit = row.jam_terlambat % 60;
          return jam > 0 ? `${jam} jam ${menit} menit` : `${menit} menit`;
        } else if (field === "jenis_pegawai") {
          const jenisMap = {
            4: "Staff",
            5: "Pegawai Lapangan",
            6: "Cleaning Services",
          };
          return jenisMap[row.id_jenis] || "Lainnya"; // Add this line
        }
        return row[field] || "-";
      });
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

    doc.save(`rekapan_presensi_${type}_${dateStr}.pdf`);
  };

  const getColumns = (type) => {
    if (type === "izin_sakit") {
      if (type === "izin_sakit") {
        return [
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
              return toTitleCase(params.value || "-");
            },
          },
          {
            field: "jenis",
            headerName: "Jenis Pegawai",
            width: 120,
            renderCell: (params) => {
              const toTitleCase = (str) =>
                str.replace(
                  /\w\S*/g,
                  (txt) =>
                    txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
                );
              return toTitleCase(params.value || "-");
            },
          },
          {
            field: "status_absen",
            headerName: "Status",
            width: 120,
          },
        ];
      }
    }

    // fallback ke struktur aslinya untuk semua tipe selain izin_sakit
    const baseColumns = [
      {
        field: "no",
        headerName: "No",
        width: 10,
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
      {
        field: "status_absen",
        headerName: "Status",
        width: 130,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "action",
        headerName: "Action",
        width: 130,
        headerAlign: "center",
        align: "center",
        renderCell: (params) => (
          <div className="flex items-center justify-center space-x-2 w-full">
            {type === "tanpa_keterangan" ? (
              <button
                onClick={() =>
                  handleTambahManualDariRow(
                    params.row.id_karyawan || params.row.id
                  )
                }
                className="flex items-center text-green-600 hover:text-green-800"
                title="Tambah Kehadiran"
              >
                <BiSolidEdit className="mr-1" />
                Hadir
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleEdit(params.row)}
                  className="flex items-center text-blue-500 hover:text-blue-700"
                  title="Edit"
                >
                  <BiSolidEdit className="mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(params.row.id_absensi)}
                  className="flex items-center text-red-500 hover:text-red-700"
                  title="Delete"
                >
                  <IoTrashBin className="mr-1" />
                  Delete
                </button>
              </>
            )}
          </div>
        ),
      },
    ];

    // Tambahan kolom jika bukan 'tanpa_keterangan' atau 'izin_sakit'
    if (type !== "tanpa_keterangan") {
      return [
        ...baseColumns.slice(0, 2),
        {
          field: "jam_masuk",
          headerName: "Check In",
          width: 90,
          align: "center",
          headerAlign: "center",
        },
        {
          field: "jam_keluar",
          headerName: "Check Out",
          width: 90,
          align: "center",
          headerAlign: "center",
          renderCell: (params) => params.value || "-",
        },
        {
          field: "lokasi_masuk",
          headerName: "Lokasi Check in",
          width: 150,
          headerAlign: "left",
          align: "left",
        },
        {
          field: "lokasi_keluar",
          headerName: "Lokasi Check out",
          width: 150,
          headerAlign: "left",
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
          width: 130,
          headerAlign: "center",
          align: "center",
          renderCell: (params) => {
            const value = params.value;
            if (value === null)
              return <span style={{ color: "green" }}>Tepat Waktu</span>;
            const jam = Math.floor(value / 60);
            const menit = value % 60;
            const display =
              jam > 0 ? `${jam} jam ${menit} menit` : `${menit} menit`;
            return <span style={{ color: "red" }}>{display}</span>;
          },
        },
        ...baseColumns.slice(2),
      ];
    }

    // Untuk 'tanpa_keterangan' tambahkan jenis pegawai
    return [
      ...baseColumns.slice(0, 2),
      {
        field: "jenis_pegawai",
        headerName: "Jenis Pegawai",
        width: 160,
        renderCell: (params) => {
          const jenisMap = {
            4: "Staff",
            5: "Pegawai Lapangan",
            6: "Pegawai Lapangan (Hybrid)",
            7: "Cleaning",
          };
          return jenisMap[params.row.id_jenis] || "Direktur";
        },
      },
      ...baseColumns.slice(2),
    ];
  };

  const getTitleByType = (tipe) => {
    switch (tipe) {
      case "hadir":
        return `List Pegawai Hadir`;
      case "izin_sakit":
        return "List Pegawai Izin/Sakit";
      case "tanpa_keterangan":
        return "List Pegawai Tanpa Keterangan";
      default:
        return "List Presensi";
    }
  };

  const daftarLokasi = ["Kantor Perampuan", "Gudang GM", "PLTG Jeranjang"];

  const handleTambahManualDariRow = (id_karyawan) => {
    setFormManual({
      id_karyawan,
      jam_masuk: "",
      jam_keluar: "",
      lokasi_masuk: "",
      lokasi_keluar: "",
    });
    setShowTambahManual(true);
  };

  return (
    <div className="ModalHadir">
      <Modal open={open} onClose={close}>
        <Box sx={style}>
          <button className="absolute top-2 right-2" onClick={close}>
            <IoClose size={30} />
          </button>

          <Typography variant="h6" component="h2" className="pb-3">
            {getTitleByType(type)}
            <div className="flex justify-between items-center text-sm mt-2">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                className="border rounded-[20px] px-3 py-1 w-80"
                placeholder="Search"
              />
            </div>
          </Typography>

          <Paper sx={{ width: "100%", height: 400, overflow: "auto" }}>
            <DataGrid
              rows={filteredData}
              columns={getColumns(type)}
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
            {type === "hadir" && (
              <button
                type="button"
                className="flex items-center text-[12px] bg-blue-600 text-white hover:bg-blue-800 rounded-[20px] px-4 py-2"
                onClick={() => setShowTambahManual(true)}
              >
                Tambah Kehadiran
              </button>
            )}
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
              {type === "tanpa_keterangan" || type === "izin_sakit" ? (
                <div>
                  <label className="text-sm">Status Absen</label>
                  <select
                    className="w-full border p-2 rounded"
                    value={editData.status_absen || ""}
                    onChange={
                      (e) => alert("dalam tahap pengembangan")
                      //setEditData({ ...editData, status_absen: e.target.value })
                    }
                  >
                    <option value="">-- Pilih Status --</option>
                    <option value="izin">Izin</option>
                    <option value="sakit">Sakit</option>
                    <option value="perjalanan_dinas">Perjalanan Dinas</option>
                  </select>
                </div>
              ) : (
                <>
                  <>
                    <div>
                      <label className="text-sm">Jam Masuk</label>
                      <input
                        type="text"
                        className="w-full border p-2 rounded"
                        value={editData.jam_masuk}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            jam_masuk: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm">Jam Keluar</label>
                      <input
                        type="text"
                        className="w-full border p-2 rounded"
                        placeholder="hh:mm"
                        value={editData.jam_keluar || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            jam_keluar: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm">Lokasi Check-In</label>
                      <select
                        className="w-full border p-2 rounded"
                        value={editData.lokasi_masuk || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            lokasi_masuk: e.target.value,
                          })
                        }
                      >
                        <option value="">Pilih Lokasi</option>
                        {daftarLokasi.map((lok, idx) => (
                          <option key={idx} value={lok}>
                            {lok}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm">Lokasi Check-Out</label>
                      <select
                        className="w-full border p-2 rounded"
                        value={editData.lokasi_keluar || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            lokasi_keluar: e.target.value,
                          })
                        }
                      >
                        <option value="">Pilih Lokasi</option>
                        {daftarLokasi.map((lok, idx) => (
                          <option key={idx} value={lok}>
                            {lok}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                </>
              )}
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setEditData(null)}
                className="px-4 py-2 rounded-[15px] bg-gray-400 text-white"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const token = localStorage.getItem("token");

                  const payload = {
                    ...editData,
                    jam_keluar:
                      editData.jam_keluar === "" ? null : editData.jam_keluar,
                  };

                  // console.log("Edit payload:", payload);

                  api
                    .put(`/absensi/edit/${editData.id_absensi}`, payload, {
                      headers: { Authorization: `Bearer ${token}` },
                    })
                    .then(() => {
                      const updated = data.map((d) =>
                        d.id_absensi === editData.id_absensi ? payload : d
                      );
                      setData(updated);
                      setFilteredData(updated);
                      setEditData(null);
                      alert("Data berhasil diperbarui!");
                      //window.location.reload();
                    })
                    .catch((err) => {
                      console.error(
                        "Gagal update:",
                        err.response?.data || err.message
                      );
                      alert(
                        err.response?.data?.message ||
                          err.response?.data?.status ||
                          "Terjadi kesalahan saat menyimpan perubahan."
                      );
                    });
                }}
                className="px-4 py-2 rounded-[15px] bg-blue-500 text-white"
              >
                Simpan
              </button>
            </div>
          </Box>
        </Modal>
      )}
      {showTambahManual && (
        <Modal open={true} onClose={() => setShowTambahManual(false)}>
          <Box sx={{ ...style, width: 400 }}>
            <Typography variant="h6" mb={2}>
              Tambah Kehadiran
            </Typography>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold">Pegawai</label>
                <select
                  className="w-full border p-2 rounded"
                  value={formManual.id_karyawan}
                  onChange={(e) =>
                    setFormManual({
                      ...formManual,
                      id_karyawan: e.target.value,
                    })
                  }
                >
                  <option value="">Pilih Pegawai</option>
                  {daftarKaryawan.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold">Jam Masuk</label>
                <input
                  type="text"
                  placeholder="hh:mm"
                  className="w-full border p-2 rounded"
                  value={formManual.jam_masuk}
                  onChange={(e) =>
                    setFormManual({ ...formManual, jam_masuk: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-semibold">Jam Keluar</label>
                <input
                  type="text"
                  placeholder="hh:mm"
                  className="w-full border p-2 rounded"
                  value={formManual.jam_keluar}
                  onChange={(e) =>
                    setFormManual({ ...formManual, jam_keluar: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-semibold">Lokasi Check-In</label>
                <select
                  className="w-full border p-2 rounded"
                  value={formManual.lokasi_masuk}
                  onChange={(e) =>
                    setFormManual({
                      ...formManual,
                      lokasi_masuk: e.target.value,
                    })
                  }
                >
                  <option value="">Pilih Lokasi</option>
                  {daftarLokasi.map((lok, idx) => (
                    <option key={idx} value={lok}>
                      {lok}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Lokasi Check-Out
                </label>
                <select
                  className="w-full border p-2 rounded"
                  value={formManual.lokasi_keluar}
                  onChange={(e) =>
                    setFormManual({
                      ...formManual,
                      lokasi_keluar: e.target.value,
                    })
                  }
                >
                  <option value="">Pilih Lokasi</option>
                  {daftarLokasi.map((lok, idx) => (
                    <option key={idx} value={lok}>
                      {lok}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowTambahManual(false)}
                className="px-4 py-2 rounded-[15px] bg-gray-400 text-white"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  const {
                    id_karyawan,
                    jam_masuk,
                    jam_keluar,
                    lokasi_masuk,
                    lokasi_keluar,
                  } = formManual;

                  if (!id_karyawan || !jam_masuk || !lokasi_masuk) {
                    alert(
                      "Pegawai, Jam Masuk, dan Lokasi Check-In wajib diisi."
                    );
                    return;
                  }

                  const token = localStorage.getItem("token");
                  try {
                    await api.post(
                      `/absensi/add/${id_karyawan}`,
                      {
                        tanggal: dayjs(selectedDate).format("YYYY-MM-DD"),
                        jam_masuk,
                        jam_keluar,
                        lokasi_masuk,
                        lokasi_keluar,
                      },
                      {
                        headers: { Authorization: `Bearer ${token}` },
                      }
                    );
                    alert("Absen berhasil ditambahkan!");
                    setShowTambahManual(false);
                    //window.location.reload();
                  } catch (err) {
                    console.error("Gagal tambah absen:", err);
                    alert("Gagal menambahkan absen.");
                  }
                }}
                className="px-4 py-2 rounded-[15px] bg-blue-500 text-white"
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
