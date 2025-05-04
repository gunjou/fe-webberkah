import React, { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

const toTitleCase = (str) => {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const FormLembur = () => {
  const [name, setName] = useState("");
  const [date, setDate] = useState(dayjs());
  const [reason, setReason] = useState("");
  const [type, setType] = useState("Sakit");
  const [attachment, setAttachment] = useState(null);
  const [startTime, setStartTime] = useState(dayjs());
  const [endTime, setEndTime] = useState(null);
  const navigate = useNavigate();
  const nama = toTitleCase(localStorage.getItem("nama"));

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      name,
      date: date ? date.format("YYYY-MM-DD") : "",
      type,
      reason,
      startTime: startTime ? startTime.format("HH:mm") : "",
      endTime: endTime ? endTime.format("HH:mm") : "",
      attachment,
    });
    alert("Pengajuan lembur berhasil dikirim!");
    navigate("/absensi");
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
        <h1 className="text-2xl font-bold mb-4 text-left">
          Form Pengajuan Lembur
        </h1>
        <p className="text-sm mb-4 text-gray-600 text-justify">
          Silakan lengkapi form berikut untuk pengajuan lembur. Pengajuan akan
          diproses sesuai kebijakan perusahaan dan harus disetujui oleh atasan
          terkait.
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
                },
              }}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-left">
              Waktu Mulai
            </label>
            <TimePicker
              value={startTime}
              onChange={(newValue) => setStartTime(newValue)}
              ampm={false}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  placeholder: "Pilih waktu mulai",
                },
              }}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-left">
              Waktu Selesai
            </label>
            <TimePicker
              value={endTime}
              onChange={(newValue) => setEndTime(newValue)}
              ampm={false}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  placeholder: "Pilih waktu selesai",
                },
              }}
            />
          </div>
        </LocalizationProvider>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-left">
            Alasan
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Masukkan alasan lembur anda"
            rows="4"
            required
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-left">
            Lampiran (Optional)
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
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
        >
          Kirim
        </button>
      </form>
    </div>
  );
};

export default FormLembur;
