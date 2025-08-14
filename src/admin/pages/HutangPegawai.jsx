import React, { useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";
import api from "../../shared/Api";

const HutangPegawai = () => {
  const [pegawaiList, setPegawaiList] = useState([]);
  const [selectedPegawai, setSelectedPegawai] = useState("");
  const [hutangList, setHutangList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Ambil daftar pegawai untuk dropdown filter
  const fetchPegawaiList = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/pegawai/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const sortedCapitalized = res.data
        .map((pegawai) => ({
          ...pegawai,
          nama: pegawai.nama
            .split(" ")
            .map(
              (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join(" "),
        }))
        .sort((a, b) => a.nama.localeCompare(b.nama));

      setPegawaiList(sortedCapitalized);
    } catch (error) {
      console.error("Gagal ambil data pegawai:", error);
      setPegawaiList([]);
    }
  };

  // Ambil data hutang dari API sesuai pegawai terpilih
  // Ambil daftar hutang
  const fetchHutangList = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/hutang/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Jika mau urutkan berdasarkan tanggal terbaru
      const sortedHutang = res.data.data.sort(
        (a, b) => new Date(b.tanggal) - new Date(a.tanggal)
      );

      setHutangList(sortedHutang);
    } catch (error) {
      console.error("Gagal ambil data hutang:", error);
      setHutangList([]);
    }
  };

  useEffect(() => {
    fetchPegawaiList();
    fetchHutangList();
  }, []);

  //   useEffect(() => {
  //     if (selectedPegawai) {
  //       fetchHutang(selectedPegawai);
  //     } else {
  //       setHutangList([]);
  //     }
  //   }, [selectedPegawai]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">Daftar Hutang</h2>

      <div className="bg-white shadow rounded-lg px-6 pb-2">
        {/* Filter Pegawai */}
        <select
          value={selectedPegawai}
          onChange={(e) => setSelectedPegawai(e.target.value)}
          className="px-2 py-2 border rounded-lg text-sm"
        >
          <option value="">Pilih Pegawai</option>
          {pegawaiList.map((pegawai) => (
            <option
              key={pegawai.id_karyawan}
              value={pegawai.id_karyawan}
              className="capitalize"
            >
              {pegawai.nama}
            </option>
          ))}
        </select>

        {/* Table */}
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <div className="max-h-80 overflow-y-auto">
            <table className="min-w-full text-sm border">
              <thead className="bg-gray-100 sticky -top-1 z-10">
                <tr>
                  <th className="border px-2 py-1 text-xs">No</th>
                  <th className="border px-2 py-1 text-xs">Nama</th>
                  <th className="border px-2 py-1 text-xs">Tanggal</th>
                  <th className="border px-2 py-1 text-xs">Nominal</th>
                  <th className="border px-2 py-1 text-xs">Keterangan</th>
                  <th className="border px-2 py-1 text-xs">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      Memuat data...
                    </td>
                  </tr>
                ) : hutangList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-500">
                      Tidak ada data hutang.
                    </td>
                  </tr>
                ) : (
                  hutangList.map((item, index) => (
                    <tr key={item.id_hutang}>
                      <td className="border px-2 py-1 text-center text-xs">
                        {index + 1}
                      </td>
                      <td className="border px-2 py-1 capitalize text-xs">
                        {item.nama}
                      </td>
                      <td className="border px-2 py-1 text-xs">
                        {item.tanggal}
                      </td>
                      <td className="border px-2 py-1 text-right text-xs">
                        Rp.{item.nominal?.toLocaleString("id-ID")}
                      </td>
                      <td className="border px-2 py-1 text-xs">
                        {item.keterangan}
                      </td>
                      <td className="border px-2 py-1 capitalize text-xs">
                        {item.status_hutang}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HutangPegawai;
