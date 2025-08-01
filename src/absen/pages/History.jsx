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
import SwipeableViews from "react-swipeable-views";
import { useMemo } from "react"; // pastikan sudah di-import
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

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
  const [dataLembur, setDataLembur] = useState([]);
  const [dataIzin, setDataIzin] = useState([]);
  const [perhitunganGaji, setPerhitunganGaji] = useState([]);
  const [rekapanBulanan, setRekapanBulanan] = useState([]);
  const [rekapanLembur, setRekapanLembur] = useState([]);
  const [rekapanGabungan, setRekapanGabungan] = useState([]);
  const navigate = useNavigate();
  const [dataHistory, setDataHistory] = useState([]);
  const [value, setValue] = React.useState(0);
  const [tanggalAbsensi, setTanggalAbsensi] = useState(dayjs());
  const [tanggalGaji, setTanggalGaji] = useState(dayjs());

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const selectedDate = useMemo(() => {
    return dayjs(
      `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`
    );
  }, [selectedMonth, selectedYear]);

  // const [dataKaryawan, setDataKaryawan] = useState(dayjs());
  // const [listDataKaryawan, setListDataKaryawan] = useState(dayjs());

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const fetchPresensi = async () => {
    const id_karyawan = localStorage.getItem("id_karyawan");
    const token = localStorage.getItem("token");

    try {
      const tanggal = tanggalAbsensi.format("DD-MM-YYYY");
      const endpoint = `/absensi/history/${id_karyawan}?tanggal=${tanggal}`;

      const response = await api.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDataHistory(response.data.history);
    } catch (err) {
      console.error("Gagal mengambil data History.");
      setDataHistory([]);
    }
  };

  const fetchPerhitunganGajiHarian = async () => {
    const token = localStorage.getItem("token");
    const id_karyawan = localStorage.getItem("id_karyawan");

    try {
      const tanggal = tanggalGaji.format("DD-MM-YYYY");
      const endpoint = `/perhitungan-gaji/harian?id_karyawan=${id_karyawan}&tanggal=${tanggal}`;

      const response = await api.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.data) {
        setPerhitunganGaji(response.data.data);
      } else {
        setPerhitunganGaji(null);
      }
    } catch (error) {
      console.error("Gagal mengambil data perhitungan gaji harian:", error);
      setPerhitunganGaji(null);
    }
  };

  const fetchRekapanBulanan = async () => {
    const token = localStorage.getItem("token");
    const id_karyawan = localStorage.getItem("id_karyawan");

    const start = selectedDate.startOf("month").format("DD-MM-YYYY");
    const end = selectedDate.endOf("month").format("DD-MM-YYYY");

    try {
      const response = await api.get(
        `/perhitungan-gaji/rekapan?start=${start}&end=${end}&id_karyawan=${id_karyawan}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Rekapan Data Response:", response.data);

      if (response.data && response.data.data?.length > 0) {
        setRekapanBulanan(response.data.data[0]);
      } else {
        setRekapanBulanan(null);
      }
    } catch (error) {
      console.error("Gagal mengambil data rekapan:", error);
      setRekapanBulanan(null);
    }
  };

  const fetchRekapanLembur = async () => {
    const token = localStorage.getItem("token");
    const id_karyawan = localStorage.getItem("id_karyawan");

    const start = selectedDate.startOf("month").format("DD-MM-YYYY");
    const end = selectedDate.endOf("month").format("DD-MM-YYYY");

    try {
      const response = await api.get(
        `/perhitungan-gaji/rekapan?start=${start}&end=${end}&id_karyawan=${id_karyawan}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Rekapan Data Response:", response.data);

      if (response.data && response.data.data?.length > 0) {
        setRekapanLembur(response.data.data[0]);
      } else {
        setRekapanLembur(null);
      }
    } catch (error) {
      console.error("Gagal mengambil data rekapan:", error);
      setRekapanLembur(null);
    }
  };

  const fetchRekapanGabungan = async () => {
    const token = localStorage.getItem("token");
    const id_karyawan = localStorage.getItem("id_karyawan");

    const start = selectedDate.startOf("month").format("DD-MM-YYYY");
    const end = selectedDate.endOf("month").format("DD-MM-YYYY");

    try {
      const response = await api.get(
        `/perhitungan-gaji/rekapan?start=${start}&end=${end}&id_karyawan=${id_karyawan}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Rekapan Data Response:", response.data);

      if (response.data && response.data.data?.length > 0) {
        setRekapanGabungan(response.data.data[0]);
      } else {
        setRekapanGabungan(null);
      }
    } catch (error) {
      console.error("Gagal mengambil data rekapan:", error);
      setRekapanGabungan(null);
    }
  };

  // Fetch lembur
  const fetchLembur = async () => {
    const token = localStorage.getItem("token");
    const id_karyawan = localStorage.getItem("id_karyawan");

    const start = selectedDate.startOf("month").format("YYYY-MM-DD");
    const end = selectedDate.endOf("month").format("YYYY-MM-DD");

    try {
      const res = await api.get(
        `/lembur/?id_karyawan=${id_karyawan}&start_date=${start}&end_date=${end}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const approved = res.data.data.filter(
        (item) => item.status_lembur === "approved"
      );
      setDataLembur(approved);
    } catch (error) {
      console.error("Gagal ambil data lembur:", error);
    }
  };

  // Fetch izin
  const fetchIzin = async () => {
    const token = localStorage.getItem("token");
    const id_karyawan = localStorage.getItem("id_karyawan");

    const start = selectedDate.startOf("month").format("YYYY-MM-DD");
    const end = selectedDate.endOf("month").format("YYYY-MM-DD");

    try {
      const res = await api.get(
        `/perizinan/?id_karyawan=${id_karyawan}&start_date=${start}&end_date=${end}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const approved = res.data.data.filter(
        (item) => item.status_izin === "approved"
      );
      setDataIzin(approved);
    } catch (error) {
      console.error("Gagal ambil data izin:", error);
    }
  };

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
  const formatTanggalBulan = (tgl) => {
    return dayjs(tgl).format("DD MMMM"); // hasil: "30 Juni"
  };

  const toTitleCase = (str) => {
    if (!str) return "-";
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  const potongTeks = (text, limit) => {
    if (!text) return "-";
    return text.length > limit ? text.substring(0, limit) + "..." : text;
  };

  const downloadPDFRekapan = () => {
    if (!rekapanGabungan) return;
    const nama = rekapanGabungan.nama || localStorage.getItem("nama") || "-";
    const doc = new jsPDF();
    const title = "Rekapan Gaji";
    const periode = `${rekapanGabungan.periode_awal} - ${rekapanGabungan.periode_akhir}`;

    doc.setFontSize(14);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.text(`Nama: ${nama}`, 14, 22);
    doc.text(`Periode: ${periode}`, 14, 28);

    const tableRows = [
      ["Jumlah Hadir", `${rekapanGabungan.jumlah_hadir} hari`],
      ["Jumlah Izin", `${rekapanGabungan.jumlah_izin} hari`],
      ["Jumlah Sakit", `${rekapanGabungan.jumlah_sakit} hari`],
      ["Jumlah Alpha", `${rekapanGabungan.jumlah_alpha} hari`],
      [
        "Total Jam Kerja",
        formatMenitToJamMenit(rekapanGabungan.total_jam_kerja),
      ],
      ["Jam Normal", formatMenitToJamMenit(rekapanGabungan.jam_normal)],
      ["Jam Terlambat", `${rekapanGabungan.jam_terlambat} menit`],
      ["Jam Kurang", `${rekapanGabungan.jam_kurang} menit`],
      ["Gaji Pokok", formatRupiah(rekapanGabungan.gaji_pokok)],
      ["Potongan", formatRupiah(rekapanGabungan.potongan)],
      [
        "Tunjangan Kehadiran",
        formatRupiah(rekapanGabungan.tunjangan_kehadiran),
      ],
      ["Total Lembur", `${rekapanGabungan.total_lembur} hari`],
      [
        "Total Bayaran Lembur",
        formatRupiah(rekapanGabungan.total_bayaran_lembur),
      ],
      ["Total Gaji Bersih", formatRupiah(rekapanGabungan.gaji_bersih)],
    ];

    doc.autoTable({
      head: [["Keterangan", "Nilai"]],
      body: tableRows,
      startY: 35,
      styles: { fontSize: 10 },
      headStyles: {
        fillColor: [139, 0, 0],
        textColor: [255, 255, 255],
        halign: "center",
        valign: "middle",
      },
      bodyStyles: {
        textColor: [0, 0, 0],
      },
    });

    doc.save(`Rekapan Gaji ${nama}.pdf`);
  };

  const downloadPDFBulanan = () => {
    if (!rekapanBulanan) return;
    const nama = rekapanBulanan.nama || localStorage.getItem("nama") || "-";
    const doc = new jsPDF();
    const title = "Rekapan Gaji Bulanan";
    const periode = `${rekapanBulanan.periode_awal} - ${rekapanBulanan.periode_akhir}`;

    doc.setFontSize(14);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.text(`Nama: ${nama}`, 14, 22);
    doc.text(`Periode: ${periode}`, 14, 28);

    const tableRows = [
      ["Jumlah Hadir", `${rekapanBulanan.jumlah_hadir} hari`],
      ["Jumlah Izin", `${rekapanBulanan.jumlah_izin} hari`],
      ["Jumlah Sakit", `${rekapanBulanan.jumlah_sakit} hari`],
      ["Jumlah Alpha", `${rekapanBulanan.jumlah_alpha} hari`],
      [
        "Total Jam Kerja",
        formatMenitToJamMenit(rekapanBulanan.total_jam_kerja),
      ],
      ["Jam Normal", formatMenitToJamMenit(rekapanBulanan.jam_normal)],
      ["Jam Terlambat", `${rekapanBulanan.jam_terlambat} menit`],
      ["Jam Kurang", `${rekapanBulanan.jam_kurang} menit`],
      ["Gaji Pokok", formatRupiah(rekapanBulanan.gaji_pokok)],
      ["Potongan", formatRupiah(rekapanBulanan.potongan)],
      ["Tunjangan Kehadiran", formatRupiah(rekapanBulanan.tunjangan_kehadiran)],
      [
        "Total Gaji Bersih",
        formatRupiah(
          rekapanBulanan.gaji_kotor -
            rekapanBulanan.potongan +
            rekapanBulanan.tunjangan_kehadiran
        ),
      ],
    ];

    doc.autoTable({
      head: [["Keterangan", "Nilai"]],
      body: tableRows,
      startY: 35,
      styles: { fontSize: 10 },
      headStyles: {
        fillColor: [139, 0, 0],
        textColor: [255, 255, 255],
        halign: "center",
        valign: "middle",
      },
      bodyStyles: {
        textColor: [0, 0, 0],
      },
    });

    doc.save(`Rekapan Gaji Bulanan ${nama}.pdf`);
  };

  const downloadPDFLembur = () => {
    if (!rekapanLembur) return;
    const nama = rekapanLembur.nama || localStorage.getItem("nama") || "-";
    const doc = new jsPDF();
    const title = "Rekapan Gaji Lembur";
    const periode = `${rekapanLembur.periode_awal} - ${rekapanLembur.periode_akhir}`;

    doc.setFontSize(14);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.text(`Nama: ${nama}`, 14, 22);
    doc.text(`Periode: ${periode}`, 14, 28);

    const tableRows = [
      ["Total Lembur", `${rekapanLembur.total_lembur} hari`],
      ["Waktu Lembur", formatMenitToJamMenit(rekapanLembur.total_menit_lembur)],
      [
        "Total Bayaran Lembur",
        formatRupiah(rekapanLembur.total_bayaran_lembur),
      ],
    ];

    doc.autoTable({
      head: [["Keterangan", "Nilai"]],
      body: tableRows,
      startY: 35,
      styles: { fontSize: 10 },
      headStyles: {
        fillColor: [139, 0, 0],
        textColor: [255, 255, 255],
        halign: "center",
        valign: "middle",
      },
      bodyStyles: {
        textColor: [0, 0, 0],
      },
    });

    doc.save(`Gaji Lembur ${nama}.pdf`);
  };

  useEffect(() => {
    fetchRekapanBulanan();
    fetchRekapanLembur();
    fetchRekapanGabungan();
    fetchLembur();
    fetchIzin();
  }, [selectedDate]);

  useEffect(() => {
    fetchPresensi();
  }, [tanggalAbsensi]);

  useEffect(() => {
    fetchPerhitunganGajiHarian();
  }, [tanggalGaji]);

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
          <div className="flex gap-2 justify-center mt-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-2 py-1 border rounded-lg text-sm bg-white text-black"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("id-ID", { month: "long" })}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-2 py-1 border rounded-lg text-sm bg-white text-black"
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
        </div>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="tabs history"
            textColor="inherit"
            TabIndicatorProps={{
              style: { backgroundColor: "white" },
            }}
          >
            <Tab
              label="Absensi"
              {...a11yProps(0)}
              sx={{
                color: "white",
                fontWeight: value === 0 ? "600" : "400",
                minWidth: "33.33%",
                textTransform: "none",
              }}
            />
            <Tab
              label="Gaji Harian"
              {...a11yProps(1)}
              sx={{
                color: "white",
                fontWeight: value === 1 ? "600" : "400",
                minWidth: "33.33%",
                textTransform: "none",
              }}
            />
            <Tab
              label="Izin/Sakit"
              {...a11yProps(2)}
              sx={{
                color: "white",
                fontWeight: value === 2 ? "600" : "400",
                minWidth: "33.33%",
                textTransform: "none",
              }}
            />

            <Tab
              label="Lembur"
              {...a11yProps(3)}
              sx={{
                color: "white",
                fontWeight: value === 3 ? "600" : "400",
                minWidth: "33.33%",
                textTransform: "none",
              }}
            />
            <Tab
              label="Gaji Bulanan"
              {...a11yProps(4)}
              sx={{
                color: "white",
                fontWeight: value === 4 ? "600" : "400",
                minWidth: "33.33%",
                textTransform: "none",
              }}
            />
            <Tab
              label="Gaji Lemburan "
              {...a11yProps(5)}
              sx={{
                color: "white",
                fontWeight: value === 5 ? "600" : "400",
                minWidth: "33.33%",
                textTransform: "none",
              }}
            />
            <Tab
              label="Rekapan Gaji"
              {...a11yProps(6)}
              sx={{
                color: "white",
                fontWeight: value === 6 ? "600" : "400",
                minWidth: "33.33%",
                textTransform: "none",
              }}
            />
          </Tabs>
        </Box>

        {/* Tab Contents */}
        <SwipeableViews
          index={value}
          onChangeIndex={(index) => setValue(index)}
          resistance
        >
          <CustomTabPanel value={value} index={0}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <div className="mb-2 flex justify-center text-white">
                <DatePicker
                  label="Pilih Tanggal"
                  value={tanggalAbsensi}
                  onChange={(newValue) => setTanggalAbsensi(newValue)}
                  format="DD-MM-YYYY"
                  slotProps={{
                    textField: {
                      InputLabelProps: { style: { color: "white" } },
                      InputProps: {
                        sx: {
                          color: "white",
                          svg: { color: "white" },
                          "& .MuiInput-underline:before": {
                            borderBottomColor: "white",
                          },
                          "& .MuiInput-underline:hover:before": {
                            borderBottomColor: "white",
                          },
                          "& .MuiInput-underline:after": {
                            borderBottomColor: "white",
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </LocalizationProvider>

            {dataHistory && dataHistory.length > 0 ? (
              <div className="overflow-x-auto pb-7">
                <table className="min-w-full text-left text-white border-separate border-spacing-y-1">
                  <tbody>
                    <tr>
                      <td>Nama</td>
                      <td className="flex font-semibold capitalize">
                        <p className="pr-2">:</p>
                        {dataHistory[0].nama || "-"}
                      </td>
                    </tr>
                    <tr>
                      <td>Jam Masuk</td>
                      <td className="flex font-semibold">
                        <p className="pr-2">:</p>
                        {dataHistory[0].jam_masuk || "-"}
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
                        {dataHistory[0].lokasi_masuk || "-"}
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
                        {formatMenitToJamMenit(
                          dataHistory[0].jam_terlambat || ""
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>Jam Bolos</td>
                      <td className="flex font-semibold">
                        <p className="pr-2">:</p>
                        {formatMenitToJamMenit(dataHistory[0].jam_bolos || "")}
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
              <p className="text-center text-sm">
                Loading atau tidak ada data.
              </p>
            )}
            <div className="text-[7pt] align-left text-left">
              <div>*jam terlambat: absen masuk setelah jam 08:00 wita</div>
              <div>**jam bolos: absen keluar sebelum jam 17:00 wita</div>
            </div>
          </CustomTabPanel>

          {/* Perhitungan Gaji Tab */}
          <CustomTabPanel value={value} index={1}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <div className="mb-2 flex justify-center">
                <DatePicker
                  label="Pilih Tanggal"
                  value={tanggalGaji}
                  onChange={(newValue) => setTanggalGaji(newValue)}
                  format="DD-MM-YYYY"
                  slotProps={{
                    textField: {
                      InputLabelProps: { style: { color: "white" } },
                      InputProps: {
                        sx: {
                          color: "white",
                          svg: { color: "white" },
                          "& .MuiInput-underline:before": {
                            borderBottomColor: "white",
                          },
                          "& .MuiInput-underline:hover:before": {
                            borderBottomColor: "white",
                          },
                          "& .MuiInput-underline:after": {
                            borderBottomColor: "white",
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </LocalizationProvider>

            <div className="overflow-x-auto pb-7">
              {perhitunganGaji ? (
                <div key={0} className="mb-4 pb-2">
                  <table className="min-w-full text-left text-white border-separate border-spacing-y-1">
                    <tbody>
                      <tr>
                        <td>Nama</td>
                        <td className="flex font-semibold capitalize">
                          <p className="pr-2">:</p>
                          {perhitunganGaji.nama || "-"}
                        </td>
                      </tr>
                      <tr>
                        <td>Gaji Harian</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {perhitunganGaji.gaji_harian
                            ? formatRupiah(perhitunganGaji.gaji_harian)
                            : "-"}
                        </td>
                      </tr>
                      <tr>
                        <td>Jam Terlambat</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {perhitunganGaji.jam_terlambat
                            ? formatMenitToJamMenit(
                                perhitunganGaji.jam_terlambat
                              )
                            : "0 menit"}
                        </td>
                      </tr>
                      <tr>
                        <td>Jam Kurang</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {perhitunganGaji.jam_kurang
                            ? formatMenitToJamMenit(perhitunganGaji.jam_kurang)
                            : "0 menit"}
                        </td>
                      </tr>
                      <tr>
                        <td>Total Jam Kerja</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {perhitunganGaji.total_jam_kerja
                            ? formatMenitToJamMenit(
                                perhitunganGaji.total_jam_kerja
                              )
                            : "-"}
                        </td>
                      </tr>
                      <tr>
                        <td>Tunjangan Kehadiran</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {perhitunganGaji.tunjangan_kehadiran
                            ? formatRupiah(perhitunganGaji.tunjangan_kehadiran)
                            : "-"}
                        </td>
                      </tr>
                      <tr>
                        <td>Upah Bersih</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {perhitunganGaji.upah_bersih
                            ? formatRupiah(perhitunganGaji.upah_bersih)
                            : "-"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center">
                  Loading atau tidak ada data perhitungan gaji.
                </p>
              )}
            </div>
          </CustomTabPanel>

          <CustomTabPanel value={value} index={2}>
            {dataIzin.length > 0 ? (
              <table className="min-w-full text-left text-white border-separate border-spacing-y-1 text-sm">
                <thead>
                  <tr>
                    <th>Mulai</th>
                    <th>Selesai</th>
                    <th>Status</th>
                    <th>Ket</th>
                  </tr>
                </thead>
                <tbody>
                  {dataIzin.map((item, i) => (
                    <tr key={i}>
                      <td>{formatTanggalBulan(item.tgl_mulai)}</td>
                      <td>{formatTanggalBulan(item.tgl_selesai)}</td>
                      <td>{item.nama_status}</td>
                      <td>{potongTeks(item.keterangan, 25)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-sm">
                Loading atau Tidak ada data izin.
              </p>
            )}
          </CustomTabPanel>

          <CustomTabPanel value={value} index={3}>
            {dataLembur.length > 0 ? (
              <>
                {/* Menampilkan List Lembur */}
                <div className="flex flex-col gap-4">
                  {dataLembur.map((item, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-lg shadow-md text-left text-white"
                    >
                      <h3 className="text-sm font-semibold mb-2">
                        {formatTanggalBulan(item.tanggal)},{" "}
                        {item.jam_mulai?.slice(0, 5)} -{" "}
                        {item.jam_selesai?.slice(0, 5)} Wita
                      </h3>
                      <p className="text-xs">
                        <strong className="mr-2 inline-block">
                          Jam Lembur:
                        </strong>{" "}
                        {formatMenitToJamMenit(item.menit_lembur)}
                      </p>
                      <p className="text-xs">
                        <strong className="mr-2 inline-block">
                          Bayar/Jam:
                        </strong>{" "}
                        {formatRupiah(item.bayaran_perjam)}
                      </p>
                      <p className="text-xs">
                        <strong className="mr-2 inline-block">
                          Total Bayaran:
                        </strong>{" "}
                        {formatRupiah(item.total_bayaran)}
                      </p>
                      <p className="text-xs">
                        <strong className="mr-2 inline-block">
                          Keterangan:
                        </strong>{" "}
                        {potongTeks(item.keterangan, 25)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Menampilkan Total Keseluruhan Bayaran */}
                <div className="mt-4 text-sm text-white">
                  <strong>Total Keseluruhan Bayaran Lembur: </strong>
                  {formatRupiah(
                    dataLembur.reduce(
                      (total, item) => total + item.total_bayaran,
                      0
                    )
                  )}
                </div>
              </>
            ) : (
              <p className="text-center text-xs">
                loading atau Tidak ada data lembur.
              </p>
            )}
          </CustomTabPanel>
          <CustomTabPanel value={value} index={4}>
            <div className="overflow-x-auto pb-7">
              {rekapanBulanan ? (
                <div key={0} className="mb-4 pb-2">
                  <table className="min-w-full text-left text-white border-separate border-spacing-y-1">
                    <tbody>
                      <tr>
                        <td>Nama</td>
                        <td className="flex font-semibold capitalize">
                          <p className="pr-2">:</p>
                          {rekapanBulanan.nama || "-"}
                        </td>
                      </tr>
                      <tr>
                        <td>Periode</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {rekapanBulanan.periode_awal} -{" "}
                          {rekapanBulanan.periode_akhir}
                        </td>
                      </tr>
                      <tr>
                        <td>Jumlah Hadir</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {rekapanBulanan.jumlah_hadir} hari
                        </td>
                      </tr>
                      <tr>
                        <td>Jumlah Izin</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {rekapanBulanan.jumlah_izin} hari
                        </td>
                      </tr>
                      <tr>
                        <td>Jumlah Sakit</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {rekapanBulanan.jumlah_sakit} hari
                        </td>
                      </tr>
                      <tr>
                        <td>Jumlah Alpha</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {rekapanBulanan.jumlah_alpha} hari
                        </td>
                      </tr>
                      <tr>
                        <td>Total Jam Kerja</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {formatMenitToJamMenit(
                            rekapanBulanan.total_jam_kerja
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Jam Normal</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {formatMenitToJamMenit(rekapanBulanan.jam_normal)}
                        </td>
                      </tr>
                      <tr>
                        <td>Jam Terlambat</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {rekapanBulanan.jam_terlambat} menit
                        </td>
                      </tr>
                      <tr>
                        <td>Jam Kurang</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {rekapanBulanan.jam_kurang} menit
                        </td>
                      </tr>
                      <tr>
                        <td>Gaji Pokok</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {formatRupiah(rekapanBulanan.gaji_pokok)}
                        </td>
                      </tr>
                      <tr>
                        <td>Gaji Kotor</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {formatRupiah(rekapanBulanan.gaji_kotor)}
                        </td>
                      </tr>
                      <tr>
                        <td>Potongan</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>-
                          {formatRupiah(rekapanBulanan.potongan)}
                        </td>
                      </tr>
                      <tr>
                        <td>Tunjangan Kehadiran</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {formatRupiah(rekapanBulanan.tunjangan_kehadiran)}
                        </td>
                      </tr>

                      <tr>
                        <td>Total Gaji Bersih</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {formatRupiah(
                            rekapanBulanan.gaji_kotor -
                              rekapanBulanan.potongan +
                              rekapanBulanan.tunjangan_kehadiran
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center">
                  Loading atau tidak ada data rekapan.
                </p>
              )}
            </div>
            {rekapanBulanan && (
              <button
                className="flex items-center mb-2 bg-red-700 hover:bg-red-800 text-white px-3 py-2 rounded text-sm"
                onClick={downloadPDFBulanan}
              >
                <FaFilePdf className="mr-2" /> Download PDF
              </button>
            )}
          </CustomTabPanel>
          <CustomTabPanel value={value} index={5}>
            <div className="overflow-x-auto pb-7">
              {rekapanLembur ? (
                <div key={0} className="mb-4 pb-2">
                  <table className="min-w-full text-left text-white border-separate border-spacing-y-1">
                    <tbody>
                      <tr>
                        <td>Nama</td>
                        <td className="flex font-semibold capitalize">
                          <p className="pr-2">:</p>
                          {rekapanLembur.nama || "-"}
                        </td>
                      </tr>
                      <tr>
                        <td>Periode</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {rekapanLembur.periode_awal} -{" "}
                          {rekapanLembur.periode_akhir}
                        </td>
                      </tr>

                      <tr>
                        <td>Total Lembur</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {rekapanLembur.total_lembur} hari
                        </td>
                      </tr>
                      <tr>
                        <td>Waktu Lembur</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {formatMenitToJamMenit(
                            rekapanLembur.total_menit_lembur
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Total Bayaran Lembur</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {formatRupiah(rekapanLembur.total_bayaran_lembur)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center">
                  Loading atau tidak ada data rekapan.
                </p>
              )}
            </div>
            {rekapanLembur && (
              <button
                className="flex items-center mb-2 bg-red-700 hover:bg-red-800 text-white px-3 py-2 rounded text-sm"
                onClick={downloadPDFLembur}
              >
                <FaFilePdf className="mr-2" /> Download PDF
              </button>
            )}
          </CustomTabPanel>
          {/* Rekapan Tab */}
          <CustomTabPanel value={value} index={6}>
            <div className="overflow-x-auto pb-7">
              {rekapanGabungan ? (
                <div key={0} className="mb-4 pb-2">
                  <table className="min-w-full text-left text-white border-separate border-spacing-y-1">
                    <tbody>
                      <tr>
                        <td>Nama</td>
                        <td className="flex font-semibold capitalize">
                          <p className="pr-2">:</p>
                          {rekapanGabungan.nama || "-"}
                        </td>
                      </tr>
                      <tr>
                        <td>Periode</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {rekapanGabungan.periode_awal} -{" "}
                          {rekapanGabungan.periode_akhir}
                        </td>
                      </tr>
                      <tr>
                        <td>Jumlah Hadir</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {rekapanGabungan.jumlah_hadir} hari
                        </td>
                      </tr>
                      <tr>
                        <td>Jumlah Izin</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {rekapanGabungan.jumlah_izin} hari
                        </td>
                      </tr>
                      <tr>
                        <td>Jumlah Sakit</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {rekapanGabungan.jumlah_sakit} hari
                        </td>
                      </tr>
                      <tr>
                        <td>Jumlah Alpha</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {rekapanGabungan.jumlah_alpha} hari
                        </td>
                      </tr>
                      <tr>
                        <td>Total Jam Kerja</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {formatMenitToJamMenit(
                            rekapanGabungan.total_jam_kerja
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Jam Normal</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {formatMenitToJamMenit(rekapanGabungan.jam_normal)}
                        </td>
                      </tr>
                      <tr>
                        <td>Jam Terlambat</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {rekapanGabungan.jam_terlambat} menit
                        </td>
                      </tr>
                      <tr>
                        <td>Jam Kurang</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {rekapanGabungan.jam_kurang} menit
                        </td>
                      </tr>
                      <tr>
                        <td>Gaji Pokok</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {formatRupiah(rekapanGabungan.gaji_pokok)}
                        </td>
                      </tr>
                      <tr>
                        <td>Potongan</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>-
                          {formatRupiah(rekapanGabungan.potongan)}
                        </td>
                      </tr>
                      <tr>
                        <td>Tunjangan Kehadiran</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {formatRupiah(rekapanGabungan.tunjangan_kehadiran)}
                        </td>
                      </tr>
                      <tr>
                        <td>Total Lembur</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {rekapanGabungan.total_lembur} hari
                        </td>
                      </tr>
                      <tr>
                        <td>Total Bayaran Lembur</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {formatRupiah(rekapanGabungan.total_bayaran_lembur)}
                        </td>
                      </tr>
                      <tr>
                        <td>Total Gaji Bersih</td>
                        <td className="flex font-semibold">
                          <p className="pr-2">:</p>
                          {formatRupiah(rekapanGabungan.gaji_bersih)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center">
                  Loading atau tidak ada data rekapan.
                </p>
              )}
            </div>
            {rekapanGabungan && (
              <button
                className="flex items-center mb-2 bg-red-700 hover:bg-red-800 text-white px-3 py-2 rounded text-sm"
                onClick={downloadPDFRekapan}
              >
                <FaFilePdf className="mr-2" /> Download PDF
              </button>
            )}
          </CustomTabPanel>
        </SwipeableViews>
      </div>
    </div>
  );
};

export default History;
