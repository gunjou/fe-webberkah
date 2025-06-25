import React, { useEffect, useState } from "react";
import { Card } from "flowbite-react";
import api from "../../shared/Api";
import { GoTrophy } from "react-icons/go";
import { IoMdClose } from "react-icons/io";

const Leaderboard = () => {
  const [palingDisiplin, setPalingDisiplin] = useState([]);
  const [kurangDisiplin, setKurangDisiplin] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(null); // "disiplin" | "tidak_disiplin" | null
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const getStartAndEndDate = (month, year) => {
    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    const end = new Date(year, month, 0).toISOString().split("T")[0];
    return { start, end };
  };

  const fetchPeringkat = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const { start, end } = getStartAndEndDate(selectedMonth, selectedYear);

      const [res1, res2] = await Promise.all([
        api.get("/peringkat/paling-disiplin", {
          headers,
          params: { start_date: start, end_date: end },
        }),
        api.get("/peringkat/kurang-disiplin", {
          headers,
          params: { start_date: start, end_date: end },
        }),
      ]);

      setPalingDisiplin(res1.data.data || []);
      setKurangDisiplin(res2.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data peringkat:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeringkat();
  }, [selectedMonth, selectedYear]);

  const renderItem = (item, index, mode) => {
    const trophyRotation = mode === "tidak_disiplin" ? "rotate-180" : "";
    const capitalize = (text) =>
      text?.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

    const formatTerlambat = (menit) => {
      if (!menit || menit === 0) return "-";
      const jam = Math.floor(menit / 60);
      const sisaMenit = menit % 60;
      return `${jam > 0 ? `${jam} jam ` : ""}${sisaMenit} menit`;
    };

    const rankColors = [
      "from-yellow-400 to-yellow-100 border-yellow-500 text-yellow-800",
      "from-gray-300 to-gray-100 border-gray-500 text-gray-700",
      "from-orange-300 to-orange-100 border-orange-500 text-orange-700",
    ];

    const bgGradient =
      index < 3
        ? `bg-gradient-to-br ${rankColors[index]} shadow-md border`
        : "bg-white border shadow-sm hover:shadow-md";

    const trophyColor = ["text-yellow-500", "text-gray-500", "text-orange-500"];

    return (
      <div
        key={item.id_karyawan}
        className={`relative rounded-xl p-4 transition-all duration-200 ${bgGradient} mb-3`}
      >
        {index < 3 && (
          <div
            className={`absolute -top-1 -left-3 p-1 rounded-full shadow-lg ${
              index === 0
                ? "bg-yellow-200"
                : index === 1
                ? "bg-gray-400"
                : "bg-orange-200"
            }`}
          >
            <GoTrophy
              className={`text-xl ${trophyColor[index]} ${trophyRotation}`}
            />
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <h4 className="text-base font-bold">
            {index + 1}. {capitalize(item.nama)}{" "}
            <span className="text-xs text-gray-600">
              ({capitalize(item.jenis)})
            </span>
          </h4>
          {mode === "disiplin" && (
            <span className="text-sm font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              {item.poin ?? 0} poin
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-700">
          {mode === "disiplin" ? (
            <>
              <div>Total Hadir: {item.jumlah_hadir}</div>
              <div>Total Terlambat: {formatTerlambat(item.jam_terlambat)}</div>
              <div>Total Lebih Awal: {formatTerlambat(item.waktu_lebih)}</div>
              <div>Total Jam Kerja: {item.total_jam_kerja} jam</div>
              <div>
                Rata-rata CheckIn: {item.rata_rata_checkin?.slice(0, 5)} WITA
              </div>
            </>
          ) : (
            <>
              <div>Total Alpha: {item.jumlah_alpha}</div>
              {/* <div>Total Sakit: {item.jumlah_sakit}</div>
              <div>Total Izin: {item.jumlah_izin}</div> */}
              <div>Total Jam Kerja: {item.total_jam_kerja} jam</div>
              <div>
                Total Terlambat: {formatTerlambat(item.total_jam_terlambat)}
              </div>
              <div>
                Rata-rata Terlambat: {formatTerlambat(item.rata_rata_terlambat)}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Leaderboard Disiplin Pegawai</h2>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex flex-col">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          onClick={() => setShowModal("disiplin")}
          className="cursor-pointer transition transform hover:scale-[1.02] hover:shadow-lg bg-gradient-to-br from-green-100 to-green-50 border border-green-300 shadow-md p-4 rounded-xl"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-green-200 p-2 rounded-full shadow">
              <GoTrophy className="text-green-700 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-green-800 mb-1">
                Pegawai Paling Disiplin
              </h3>
              <p className="text-sm text-green-700">
                Klik untuk melihat detail
              </p>
            </div>
          </div>
        </Card>

        <Card
          onClick={() => setShowModal("tidak_disiplin")}
          className="cursor-pointer transition transform hover:scale-[1.02] hover:shadow-lg bg-gradient-to-br from-red-100 to-red-50 border border-red-300 shadow-md p-4 rounded-xl"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-red-200 p-2 rounded-full shadow">
              <GoTrophy className="text-red-700 text-xl rotate-180" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-800 mb-1">
                Pegawai Kurang Disiplin
              </h3>
              <p className="text-sm text-red-700">Klik untuk melihat detail</p>
            </div>
          </div>
        </Card>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          onClick={() => setShowModal(null)} // Handle click outside modal to close
        >
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <div className="flex justify-between items-center rounded-lg border-b px-6 py-4 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold">
                {showModal === "disiplin"
                  ? "Pegawai Paling Disiplin"
                  : "Pegawai Kurang Disiplin"}
              </h3>
              <button
                onClick={() => setShowModal(null)}
                className="text-gray-500 hover:text-black text-xl"
              >
                <IoMdClose />
              </button>
            </div>
            <div
              className="px-4 py-2 overflow-y-auto"
              style={{ maxHeight: "440px" }}
            >
              {loading ? (
                <p className="text-center py-4">Memuat data...</p>
              ) : showModal === "disiplin" ? (
                palingDisiplin.length ? (
                  palingDisiplin
                    .filter((item) => item.poin > 0)
                    .map((item, index) => renderItem(item, index, "disiplin"))
                ) : (
                  <p className="text-center text-gray-500">Tidak ada data.</p>
                )
              ) : kurangDisiplin.length ? (
                kurangDisiplin.map((item, index) =>
                  renderItem(item, index, "tidak_disiplin")
                )
              ) : (
                <p className="text-center text-gray-500">Tidak ada data.</p>
              )}
            </div>
            <div className="border-t px-6 py-2 text-right"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
