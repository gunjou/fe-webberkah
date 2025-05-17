import React, { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const toTitleCase = (str) => {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const FormIzinSakit = () => {
  const [name, setName] = useState("");
  const [date, setDate] = useState(dayjs());
  const [reason, setReason] = useState("");
  const [type, setType] = useState("Sakit"); // State untuk dropdown pilihan
  const [attachment, setAttachment] = useState(null);
  const navigate = useNavigate();
  const nama = toTitleCase(localStorage.getItem("nama"));

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      name,
      date,
      type,
      reason,
      attachment,
    });
    alert("Pengajuan izin berhasil dikirim!");
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-custom-merah to-custom-gelap flex items-center justify-center">
      <div className="w-full px-4 pt-4 absolute top-0 left-0 flex justify-start">
        <button
          onClick={() => navigate(-1)}
          className="text-white text-2xl hover:text-gray-300"
        >
          <FiArrowLeft />
        </button>
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-white text-black p-6 rounded-lg mt-[60px] shadow-lg w-full max-w-lg mx-4 my-4"
      >
        <h1 className="text-2xl font-bold mb-4 text-left">Form Izin/Sakit</h1>
        <p className="text-sm mb-4 text-gray-600 text-justify">
          Silakan isi form berikut dengan lengkap dan jelas untuk keperluan
          pengajuan izin atau sakit. Data yang Anda berikan akan digunakan untuk
          keperluan administrasi dan dokumentasi internal.
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-left">
            Nama
          </label>
          <input
            type="text"
            value={nama}
            className="w-full px-3 py-2 border rounded-lg"
            readOnly
          />
        </div>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-left">
              Tanggal
            </label>
            <DatePicker
              value={date}
              onChange={(newValue) => setDate(newValue)}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  placeholder: "Pilih tanggal",
                  className: "placeholder:text-xs",
                },
              }}
            />
          </div>
        </LocalizationProvider>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-left">
            Jenis
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          >
            <option value="Sakit">Pilih Jenis</option>
            <option value="Sakit">Sakit</option>
            <option value="Izin">Izin</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-left">
            Alasan
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg placeholder:text-xs"
            placeholder="Masukkan alasan Anda"
            rows="4"
            required
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-left">
            Lampiran
          </label>
          <input
            type="file"
            onChange={(e) => setAttachment(e.target.files[0])}
            className="w-full px-3 py-2 border rounded-lg"
            accept="image/*,application/pdf"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-custom-merah text-white py-2 rounded-lg hover:bg-custom-gelap"
        >
          Kirim
        </button>
      </form>
    </div>
  );
};

export default FormIzinSakit;
