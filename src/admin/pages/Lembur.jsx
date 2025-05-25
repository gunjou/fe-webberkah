import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import api from "../../shared/Api";

const Lembur = () => {
  const [tanggal, setTanggal] = useState(null); // null = tampilkan semua
  const [lemburList, setLemburList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [actionLoading, setActionLoading] = useState(null); // id_lembur yang sedang diproses
  const [rejectId, setRejectId] = useState(null);
  const [alasanReject, setAlasanReject] = useState("");

  const fetchLembur = async (tgl) => {
    setLoading(true);
    setErrMsg("");
    try {
      const token = localStorage.getItem("token");
      // Ambil semua data jika tgl null, filter di FE
      const res = await api.get(`/lembur/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let data = res.data.data;
      if (!data) setLemburList([]);
      else if (Array.isArray(data)) {
        // Jika ada filter tanggal, filter di FE
        setLemburList(
          tgl
            ? data.filter(
                (item) =>
                  item.tanggal &&
                  dayjs(item.tanggal).format("YYYY-MM-DD") ===
                    dayjs(tgl).format("YYYY-MM-DD")
              )
            : data
        );
      } else {
        setLemburList(
          tgl
            ? data.tanggal &&
              dayjs(data.tanggal).format("YYYY-MM-DD") ===
                dayjs(tgl).format("YYYY-MM-DD")
              ? [data]
              : []
            : [data]
        );
      }
    } catch (err) {
      setErrMsg("Gagal memuat data lembur.");
      setLemburList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLembur(tanggal);
    // eslint-disable-next-line
  }, [tanggal]);

  const handleApprove = async (id_lembur) => {
    if (!window.confirm("Setujui lembur ini?")) return;
    setActionLoading(id_lembur);
    try {
      const token = localStorage.getItem("token");
      await api.post(
        `/lembur/${id_lembur}/approve`,
        {},
        {
          "Content-Type": undefined,
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchLembur(tanggal);
    } catch (err) {
      alert("Gagal approve lembur!");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id_lembur) => {
    if (!alasanReject.trim()) {
      alert("Alasan penolakan wajib diisi!");
      return;
    }
    setActionLoading(id_lembur);
    try {
      const token = localStorage.getItem("token");
      await api.post(
        `/lembur/${id_lembur}/reject`,
        { alasan_penolakan: alasanReject },
        {
          "Content-Type": undefined,
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRejectId(null);
      setAlasanReject("");
      fetchLembur(tanggal);
    } catch (err) {
      alert("Gagal reject lembur!");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="Lembur p-4">
      <div className="flex items-center gap-4 mb-4">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Filter Tanggal"
            value={tanggal}
            onChange={setTanggal}
            format="DD/MM/YYYY"
            slotProps={{
              textField: {
                size: "small",
                sx: { minWidth: 180 },
              },
            }}
          />
        </LocalizationProvider>
        <button
          className="ml-2 text-xs text-red-500 underline"
          onClick={() => setTanggal(null)}
          type="button"
        >
          Reset
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-bold mb-4">Data Pengajuan Lembur</h2>
        {loading ? (
          <div className="py-8 text-center">Memuat data...</div>
        ) : errMsg ? (
          <div className="text-red-500 py-8 text-center">{errMsg}</div>
        ) : lemburList.length === 0 ? (
          <div className="text-gray-500 py-8 text-center">
            Tidak ada pengajuan lembur pada tanggal ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">Nama</th>
                  <th className="border px-2 py-1">Tanggal</th>
                  <th className="border px-2 py-1">Jam Mulai</th>
                  <th className="border px-2 py-1">Jam Selesai</th>
                  <th className="border px-2 py-1">Deskripsi</th>
                  <th className="border px-2 py-1">Lampiran</th>
                  <th className="border px-2 py-1">Status</th>
                  <th className="border px-2 py-1">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {lemburList.map((item) => (
                  <tr key={item.id_lembur}>
                    <td className="border px-2 py-1">
                      {/* Nama capitalize */}
                      {item.nama
                        ? item.nama.replace(/\b\w/g, (c) => c.toUpperCase())
                        : "-"}
                    </td>
                    <td className="border px-2 py-1">
                      {item.tanggal
                        ? dayjs(item.tanggal).format("DD/MM/YYYY")
                        : "-"}
                    </td>
                    <td className="border px-2 py-1">
                      {item.jam_mulai || "-"}
                    </td>
                    <td className="border px-2 py-1">
                      {item.jam_selesai || "-"}
                    </td>
                    <td className="border px-2 py-1">
                      {item.deskripsi || "-"}
                    </td>
                    <td className="border px-2 py-1">
                      {item.path_lampiran ? (
                        <a
                          href={item.path_lampiran}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                          title="Lihat lampiran"
                        >
                          Lihat
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="border px-2 py-1 font-semibold">
                      <span
                        className={
                          item.status_lembur === "approved"
                            ? "text-green-600"
                            : item.status_lembur === "pending"
                            ? "text-yellow-600"
                            : item.status_lembur === "rejected"
                            ? "text-red-600"
                            : ""
                        }
                      >
                        {item.status_lembur
                          ? item.status_lembur.charAt(0).toUpperCase() +
                            item.status_lembur.slice(1)
                          : "-"}
                      </span>
                    </td>
                    <td className="border px-2 py-1">
                      {item.status_lembur === "pending" ? (
                        rejectId === item.id_lembur ? (
                          <div className="flex flex-col gap-1">
                            <input
                              type="text"
                              className="border px-2 py-1 rounded text-xs"
                              placeholder="Alasan penolakan"
                              value={alasanReject}
                              onChange={(e) => setAlasanReject(e.target.value)}
                              disabled={actionLoading === item.id_lembur}
                            />
                            <div className="flex gap-1">
                              <button
                                className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                                onClick={() => handleReject(item.id_lembur)}
                                disabled={actionLoading === item.id_lembur}
                              >
                                {actionLoading === item.id_lembur
                                  ? "Memproses..."
                                  : "Tolak"}
                              </button>
                              <button
                                className="bg-gray-300 hover:bg-gray-400 text-black px-2 py-1 rounded text-xs"
                                onClick={() => {
                                  setRejectId(null);
                                  setAlasanReject("");
                                }}
                                type="button"
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <button
                              className="bg-green-500 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                              onClick={() => handleApprove(item.id_lembur)}
                              disabled={actionLoading === item.id_lembur}
                            >
                              {actionLoading === item.id_lembur
                                ? "Memproses..."
                                : "Approve"}
                            </button>
                            <button
                              className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                              onClick={() => {
                                setRejectId(item.id_lembur);
                                setAlasanReject("");
                              }}
                              disabled={actionLoading === item.id_lembur}
                            >
                              Tolak
                            </button>
                          </div>
                        )
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lembur;
