import React, { useState, useEffect } from "react";
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
          <div className="overflow-x-auto pb-7">Rekapan</div>
        </CustomTabPanel>
      </div>
    </div>
  );
};

export default History;
