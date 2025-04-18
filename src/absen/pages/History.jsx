import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import dayjs from "dayjs";
import api from "../../shared/Api";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { FaFilePdf } from "react-icons/fa";

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
function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box
          sx={{ p: 3 }}
          className="flex flex-col items-center text-center text-white"
        >
          {children}
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const History = () => {
  const navigate = useNavigate();
  const [dataHistory, setDataHistory] = useState(null);
  const [value, setValue] = React.useState(0);
  const [selectedDate, setSelectedDate] = React.useState(dayjs());
  const [dataKaryawan, setDataKaryawan] = useState(dayjs());
  const [listDataKaryawan, setListDataKaryawan] = useState(dayjs());

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    const fetchPresensi = async () => {
      const id_karyawan = localStorage.getItem("id_karyawan");
      const token = localStorage.getItem("token");

      try {
        let endpoint = `/absensi/history/${id_karyawan}`;

        if (selectedDate) {
          const tanggal = selectedDate.format("DD-MM-YYYY");
          endpoint += `?tanggal=${tanggal}`;
        }

        const response = await api.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log(response.data.history);
        setDataHistory(response.data.history);
      } catch (err) {
        console.error("Gagal mengambil data History.");
      }
    };

    fetchPresensi();
  }, [selectedDate]);

  useEffect(() => {
    const fetchRekapanKaryawan = async () => {
      const token = localStorage.getItem("token");

      try {
        const start = selectedDate.startOf("month").format("DD-MM-YYYY");
        const end = selectedDate.endOf("month").format("DD-MM-YYYY");

        const response = await api.get(
          `/rekapan-person?start=${start}&end=${end}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Rekapan Response:", response.data.data_karyawan);

        setDataKaryawan(response.data.data_karyawan);
      } catch (error) {
        console.error("Gagal mengambil data rekapan karyawan:", error);
        setDataKaryawan(null); // biar nggak nunggu loading terus
      }
    };

    fetchRekapanKaryawan();
  }, [selectedDate]);

  useEffect(() => {
    const fetchListRekapanKaryawan = async () => {
      const token = localStorage.getItem("token");

      try {
        const start = selectedDate.startOf("month").format("DD-MM-YYYY");
        const end = selectedDate.endOf("month").format("DD-MM-YYYY");

        const response = await api.get(
          `/list-rekapan-person?start=${start}&end=${end}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Rekapan Response:", response.data.data_absensi);

        setListDataKaryawan(response.data.data_absensi);
      } catch (error) {
        console.error("Gagal mengambil list data rekapan karyawan:", error);
        setListDataKaryawan(null); // biar nggak nunggu loading terus
      }
    };

    fetchListRekapanKaryawan();
  }, [selectedDate]);

  const formatMenitToJamMenit = (menit) => {
    const jam = Math.floor(menit / 60);
    const sisaMenit = menit % 60;

    if (jam > 0 && sisaMenit > 0) {
      return `${jam} jam ${sisaMenit} menit`;
    } else if (jam > 0) {
      return `${jam} jam`;
    } else {
      return `${sisaMenit} menit`;
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

  const downloadPDF = () => {
    const nama = localStorage.getItem("nama");
    const confirmDownload = window.confirm(
      "Apakah Anda yakin ingin mengunduh data sebagai file PDF?"
    );
    if (!confirmDownload) return;

    const doc = new jsPDF();
    const title = "Rekapan Presensi";
    const dateStr = getFormattedDate(); // misalnya: April 2025

    doc.setFontSize(14);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.text(`Periode: ${dateStr}`, 14, 22);

    const tableColumn = [
      "No",
      "Tanggal",
      "Nama",
      "Tipe Pegawai",
      "Status",
      "Jam Masuk",
      "Jam Keluar",
      "Terlambat",
      "Jam Kurang",
      "Total Jam Kerja",
      "Lokasi Masuk",
      "Lokasi Keluar",
    ];

    const tableRows = listDataKaryawan.map((row, index) => [
      index + 1,
      new Date(row.tanggal).toLocaleDateString("id-ID", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      row.nama || "-",
      row.tipe || "-",
      row.nama_status || "-",
      row.jam_masuk || "-",
      row.jam_keluar || "-",
      row.jam_terlambat || "-",
      row.jam_kurang || "-",
      row.total_jam_kerja || "-",
      row.lokasi_masuk || "-",
      row.lokasi_keluar || "-",
    ]);

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

    doc.save(`Rekapan Presensi ${toTitleCase(nama)}.pdf`);
  };

  return (
    <div className="bg-gradient-to-b text-white from-custom-merah to-custom-gelap min-h-[100dvh] flex flex-col items-center relative">
      <div className="w-full px-4 pt-4 absolute top-0 left-0 flex justify-start">
        <button
          onClick={() => navigate(-1)}
          className="text-white text-2xl hover:text-gray-300"
        >
          <FiArrowLeft />
        </button>
      </div>
      <div className="mt-10 w-full max-w-xl">
        <div className="text-center pb-2 text-white text-xl font-semibold">
          History Absensi
        </div>
        <div>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MobileDatePicker
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              format="DD MMMM YYYY"
              slotProps={{
                textField: {
                  variant: "outlined",
                  InputProps: {
                    sx: {
                      px: 0.5,
                      py: 0.5,
                      borderRadius: "20px",
                      border: "1px solid white",
                      color: "white",
                      fontWeight: "bold",
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      textAlign: "center",
                      "& input": {
                        textAlign: "center",
                        cursor: "pointer",
                        outline: "none",
                      },
                      "& fieldset": {
                        border: "none",
                      },
                      "&.Mui-focused": {
                        outline: "none",
                        boxShadow: "none",
                        border: "1px solid white",
                      },
                    },
                  },
                  inputProps: {
                    style: {
                      padding: "6px 5px",
                      fontSize: "14px",
                    },
                  },
                },
              }}
            />
          </LocalizationProvider>
        </div>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
            textColor="inherit"
            TabIndicatorProps={{
              style: {
                backgroundColor: "white",
              },
            }}
            centered
          >
            <Tab
              label="Absensi"
              {...a11yProps(0)}
              sx={{
                color: "white",
                fontWeight: value === 0 ? "600" : "400",
                textTransform: "none",
              }}
            />
            <Tab
              label="Perhitungan Gaji"
              {...a11yProps(1)}
              sx={{
                color: "white",
                fontWeight: value === 1 ? "600" : "400",
                textTransform: "none",
              }}
            />
            <Tab
              label="Rekapan"
              {...a11yProps(1)}
              sx={{
                color: "white",
                fontWeight: value === 1 ? "600" : "400",
                textTransform: "none",
              }}
            />
          </Tabs>
        </Box>

        {/* Tab Contents */}
        <CustomTabPanel value={value} index={0}>
          {dataHistory && dataHistory.length > 0 ? (
            <div className="overflow-x-auto pb-7">
              <table className="min-w-full text-left text-white border-separate border-spacing-y-1">
                <tbody>
                  <tr>
                    <td>Status</td>
                    <td className="flex font-semibold">
                      <p className="pr-2">:</p>
                      {dataHistory[0].status_presensi}
                    </td>
                  </tr>
                  <tr>
                    <td>Jam Masuk</td>
                    <td className="flex font-semibold">
                      <p className="pr-2">:</p>
                      {dataHistory[0].jam_masuk}
                    </td>
                  </tr>
                  <tr>
                    <td>Jam Keluar</td>
                    <td className="flex font-semibold">
                      <p className="pr-2">:</p>
                      {dataHistory[0].jam_keluar || "-"}
                    </td>
                  </tr>
                  <tr>
                    <td>Lokasi Masuk</td>
                    <td className="flex font-semibold">
                      <p className="pr-2">:</p>
                      {dataHistory[0].lokasi_masuk}
                    </td>
                  </tr>
                  <tr>
                    <td>Lokasi Keluar</td>
                    <td className="flex font-semibold">
                      <p className="pr-2">:</p>
                      {dataHistory[0].lokasi_keluar || "-"}
                    </td>
                  </tr>
                  <tr>
                    <td>Jam Terlambat</td>
                    <td className="flex font-semibold">
                      <p className="pr-2">:</p>
                      {formatMenitToJamMenit(dataHistory[0].jam_terlambat)}
                    </td>
                  </tr>
                  <tr>
                    <td>Jam Bolos</td>
                    <td className="flex font-semibold">
                      <p className="pr-2">:</p>
                      {formatMenitToJamMenit(dataHistory[0].jam_bolos)}
                    </td>
                  </tr>
                  <tr>
                    <td>Total Jam Kerja</td>
                    <td className="flex font-semibold">
                      <p className="pr-2">:</p>
                      {formatMenitToJamMenit(dataHistory[0].total_jam_kerja)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-sm">Loading atau tidak ada data.</p>
          )}
          <div className="text-[7pt] align-left text-left">
            <div>*jam terlambat: absen masuk setelah jam 08:00 wita</div>
            <div>**jam bolos: absen keluar sebelum jam 17:00 wita</div>
          </div>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <div className="overflow-x-auto pb-7">
            {dataHistory && dataHistory.length > 0 ? (
              dataHistory.map((item, index) => (
                <div
                  key={index}
                  className="mb-4 border-b border-t border-white pb-2"
                >
                  <table className="min-w-full text-left text-white border-separate border-spacing-y-1">
                    <tbody>
                      <tr>
                        <td>Status</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {item.status_presensi}
                        </td>
                      </tr>
                      <tr>
                        <td>Jam Masuk</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {item.jam_masuk}
                        </td>
                      </tr>
                      <tr>
                        <td>Jam Keluar</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {item.jam_keluar || "-"}
                        </td>
                      </tr>
                      <tr>
                        <td>Jam Kurang</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {formatMenitToJamMenit(item.jam_kurang)}
                        </td>
                      </tr>
                      <tr>
                        <td>Total Jam Kerja</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {formatMenitToJamMenit(item.total_jam_kerja)}
                        </td>
                      </tr>
                      <tr>
                        <td>Gaji Pokok</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {formatRupiah(item.gaji_pokok)}
                        </td>
                      </tr>
                      <tr>
                        <td>Gaji Harian</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {formatRupiah(item.gaji_maks_harian)}
                        </td>
                      </tr>
                      <tr>
                        <td>Potongan</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>-
                          {formatRupiah(item.potongan)}
                        </td>
                      </tr>
                      <tr>
                        <td>Total Gaji Harian</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {formatRupiah(item.total_gaji_harian)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))
            ) : (
              <p className="text-center">Loading atau tidak ada data.</p>
            )}
          </div>
          <div className="text-[7pt] align-left text-left">
            <div>*jam kurang: akumulasi jam terlambat + jam bolos</div>
          </div>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          {dataKaryawan ? (
            <div className="overflow-x-auto pb-7">
              <table className="min-w-full text-left text-white border-separate border-spacing-y-1 text-sm">
                <tbody>
                  <tr>
                    <td>Nama</td>
                    <td className="flex font-semibold">
                      <p className="pr-2">:</p>
                      {toTitleCase(dataKaryawan.nama)}
                    </td>
                  </tr>
                  <tr>
                    <td>Periode</td>
                    <td className="flex font-semibold">
                      <p className="pr-2">:</p>
                      {selectedDate.startOf("month").format("DD MMM YYYY")} -
                    </td>
                  </tr>
                  <tr>
                    <td> </td>
                    <td className="flex font-semibold">
                      <p className="pr-2">:</p>
                      {selectedDate.endOf("month").format("DD MMM YYYY")}
                    </td>
                  </tr>
                  <tr>
                    <td>Total Hadir</td>
                    <td className="flex font-semibold">
                      <p className="pr-2">:</p>
                      {dataKaryawan.jumlah_hadir} hari
                    </td>
                  </tr>
                  <tr>
                    <td>Total Dinas Luar</td>
                    <td className="flex font-semibold">
                      <p className="pr-2">:</p>
                      {dataKaryawan.dinas_luar} hari
                    </td>
                  </tr>
                  <tr>
                    <td>Izin / Sakit</td>
                    <td className="flex font-semibold">
                      <p className="pr-2">:</p>
                      {dataKaryawan.jumlah_izin +
                        dataKaryawan.jumlah_sakit}{" "}
                      hari
                    </td>
                  </tr>
                  <tr>
                    <td>Alpha</td>
                    <td className="flex font-semibold">
                      <p className="pr-2">:</p>
                      {dataKaryawan.jumlah_alpha} hari
                    </td>
                  </tr>
                  <tr>
                    <td>Jam Kerja</td>
                    <td className="flex font-semibold">
                      <p className="pr-2">:</p>
                      {formatMenitToJamMenit(dataKaryawan.total_jam_kerja)}
                    </td>
                  </tr>
                  <tr>
                    <td>Jam Normal</td>
                    <td className="flex font-semibold">
                      <p className="pr-2">:</p>
                      {formatMenitToJamMenit(
                        dataKaryawan.total_jam_kerja_normal
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>Jam Terlambat</td>
                    <td className="flex font-semibold">
                      <p className="pr-2">:</p>
                      {formatMenitToJamMenit(dataKaryawan.total_jam_terlambat)}
                    </td>
                  </tr>
                  <tr>
                    <td>Jam Kurang</td>
                    <td className="flex font-semibold">
                      <p className="pr-2">:</p>
                      {formatMenitToJamMenit(dataKaryawan.total_jam_kurang)}
                    </td>
                  </tr>
                  <tr>
                    <td>Gaji Pokok</td>
                    <td className="flex font-semibold">
                      <p className="pr-2">:</p>
                      {formatRupiah(dataKaryawan.gaji_pokok)}
                    </td>
                  </tr>
                  <tr>
                    <td>Gaji Harian</td>
                    <td className="flex font-semibold">
                      <p className="pr-2">:</p>
                      {formatRupiah(dataKaryawan.gaji_per_hari)}
                    </td>
                  </tr>
                  <tr>
                    <td>Hari Dibayar</td>
                    <td className="flex font-semibold">
                      <p className="pr-2">:</p>
                      {dataKaryawan.hari_dibayar} hari
                    </td>
                  </tr>
                  <tr>
                    <td>Potongan</td>
                    <td className="flex font-semibold">
                      <p className="pr-2">:</p>-{" "}
                      {formatRupiah(dataKaryawan.potongan)}
                    </td>
                  </tr>
                  <tr>
                    <td>Total Gaji Bersih</td>
                    <td className="flex font-semibold">
                      <p className="pr-2">:</p>
                      {formatRupiah(dataKaryawan.gaji_bersih)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="text-center pt-4">
                      <button
                        type="button"
                        className="flex items-center justify-center mx-auto text-[12px] bg-red-700 text-white hover:bg-red-500 rounded-[20px] px-4 py-2"
                        onClick={downloadPDF}
                      >
                        <span className="text-xs pr-2">
                          <FaFilePdf />
                        </span>
                        Unduh PDF
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-sm">Loading atau tidak ada data.</p>
          )}
        </CustomTabPanel>
      </div>
    </div>
  );
};

export default History;
