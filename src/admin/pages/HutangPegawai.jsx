import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import api from "../../shared/Api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const HutangPegawai = () => {
  const [pegawaiList, setPegawaiList] = useState([]);
  const [selectedPegawai, setSelectedPegawai] = useState("");
  const [hutangList, setHutangList] = useState([]);
  const [loading, setLoading] = useState(false);

  // State filter
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1); // default bulan sekarang
  const [selectedYear, setSelectedYear] = useState(dayjs().year()); // default tahun sekarang
  const [selectedStatus, setSelectedStatus] = useState("");

  // State modal tambah hutang
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id_karyawan: "",
    tanggal: dayjs().format("YYYY-MM-DD"),
    nominal: "",
    keterangan: "",
  });
  const [saving, setSaving] = useState(false);

  // Ambil daftar pegawai
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

  // Ambil daftar hutang
  const fetchHutangList = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await api.get("/hutang/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const sortedHutang = res.data.data.sort(
        (a, b) => new Date(b.tanggal) - new Date(a.tanggal)
      );

      setHutangList(sortedHutang);
    } catch (error) {
      console.error("Gagal ambil data hutang:", error);
      setHutangList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPegawaiList();
    fetchHutangList();
  }, []);

  // Tambah hutang
  const handleTambahHutang = async (e) => {
    e.preventDefault();
    if (!formData.id_karyawan || !formData.tanggal || !formData.nominal) {
      alert("Pegawai, tanggal, dan nominal wajib diisi!");
      return;
    }
    if (formData.nominal <= 0) {
      alert("Nominal harus lebih dari 0!");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      await api.post(
        "/hutang/",
        {
          ...formData,
          id_karyawan: Number(formData.id_karyawan),
          nominal: Number(formData.nominal),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Hutang berhasil ditambahkan ✅");
      setFormData({
        id_karyawan: "",
        tanggal: dayjs().format("YYYY-MM-DD"),
        nominal: "",
        keterangan: "",
      });
      setShowModal(false);
      fetchHutangList();
    } catch (error) {
      console.error("Gagal tambah hutang:", error);
      alert("Gagal menambahkan hutang ❌");
    } finally {
      setSaving(false);
    }
  };

  // Filter data
  const filteredHutang = hutangList.filter((item) => {
    const itemDate = dayjs(item.tanggal);

    const matchPegawai = selectedPegawai
      ? item.id_karyawan === Number(selectedPegawai)
      : true;

    const matchMonth = selectedMonth
      ? itemDate.month() + 1 === Number(selectedMonth)
      : true;

    const matchYear = selectedYear
      ? itemDate.year() === Number(selectedYear)
      : true;

    const matchStatus = selectedStatus
      ? item.status_hutang === selectedStatus
      : true;

    return matchPegawai && matchMonth && matchYear && matchStatus;
  });

  // Hitung total hutang
  const totalHutang = filteredHutang.reduce(
    (sum, item) => sum + (item.nominal || 0),
    0
  );

  // Export ke Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredHutang.map((item, i) => ({
        No: i + 1,
        Nama: item.nama,
        Tanggal: item.tanggal,
        Nominal: item.nominal,
        Keterangan: item.keterangan,
        Status: item.status_hutang,
      }))
    );

    XLSX.utils.sheet_add_aoa(ws, [["", "", "", "TOTAL", totalHutang]], {
      origin: -1,
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hutang Pegawai");
    XLSX.writeFile(
      wb,
      `hutang_pegawai_${selectedMonth || "all"}_${selectedYear || "all"}.xlsx`
    );
  };

  // Export ke PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Daftar Hutang Pegawai", 14, 15);
    doc.autoTable({
      startY: 20,
      head: [["No", "Nama", "Tanggal", "Nominal", "Keterangan", "Status"]],
      body: filteredHutang.map((item, i) => [
        i + 1,
        item.nama,
        item.tanggal,
        `Rp.${item.nominal?.toLocaleString("id-ID")}`,
        item.keterangan,
        item.status_hutang,
      ]),
      foot: [
        ["", "", "", "TOTAL", `Rp.${totalHutang.toLocaleString("id-ID")}`, ""],
      ],
    });
    doc.save(
      `hutang_pegawai_${selectedMonth || "all"}_${selectedYear || "all"}.pdf`
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold">Daftar Hutang</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm"
        >
          + Tambah Hutang
        </button>
      </div>

      {/* Modal Tambah Hutang */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">Tambah Hutang</h3>
            <form onSubmit={handleTambahHutang} className="space-y-3">
              <select
                value={formData.id_karyawan}
                onChange={(e) =>
                  setFormData({ ...formData, id_karyawan: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              >
                <option value="">Pilih Pegawai</option>
                {pegawaiList.map((pegawai) => (
                  <option key={pegawai.id_karyawan} value={pegawai.id_karyawan}>
                    {pegawai.nama}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={formData.tanggal}
                onChange={(e) =>
                  setFormData({ ...formData, tanggal: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              />

              <input
                type="number"
                placeholder="Nominal"
                value={formData.nominal}
                onChange={(e) =>
                  setFormData({ ...formData, nominal: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              />

              <input
                type="text"
                placeholder="Keterangan"
                value={formData.keterangan}
                onChange={(e) =>
                  setFormData({ ...formData, keterangan: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Card Filter + Tabel */}
      <div className="bg-white shadow rounded-lg p-4">
        {/* Filter */}
        <div className="flex flex-wrap gap-2 items-center mb-3">
          <select
            value={selectedPegawai}
            onChange={(e) => setSelectedPegawai(Number(e.target.value))}
            className="px-2 py-2 border rounded-lg text-sm"
          >
            <option value="">Semua Pegawai</option>
            {pegawaiList.map((pegawai) => (
              <option key={pegawai.id_karyawan} value={pegawai.id_karyawan}>
                {pegawai.nama}
              </option>
            ))}
          </select>

          <select
            value={selectedMonth}
            onChange={(e) =>
              setSelectedMonth(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            className="px-2 py-2 border rounded-lg text-sm"
          >
            <option value="">Semua Bulan</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((bulan) => (
              <option key={bulan} value={bulan}>
                {dayjs()
                  .month(bulan - 1)
                  .format("MMMM")}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) =>
              setSelectedYear(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            className="px-2 py-2 border rounded-lg text-sm"
          >
            <option value="">Semua Tahun</option>
            {Array.from({ length: 5 }, (_, i) => dayjs().year() - 2 + i).map(
              (tahun) => (
                <option key={tahun} value={tahun}>
                  {tahun}
                </option>
              )
            )}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2 py-2 border rounded-lg text-sm"
          >
            <option value="">Semua Status</option>
            <option value="lunas">Lunas</option>
            <option value="belum lunas">Belum Lunas</option>
          </select>

          <button
            onClick={exportToExcel}
            className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm"
          >
            Download Excel
          </button>
          <button
            onClick={exportToPDF}
            className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm"
          >
            Download PDF
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
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
                ) : filteredHutang.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-500">
                      Tidak ada data hutang.
                    </td>
                  </tr>
                ) : (
                  filteredHutang.map((item, index) => (
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
              {filteredHutang.length > 0 && (
                <tfoot>
                  <tr className="bg-gray-100 font-bold">
                    <td colSpan="3" className="border px-2 py-1 text-right">
                      TOTAL
                    </td>
                    <td className="border px-2 py-1 text-right">
                      Rp.{totalHutang.toLocaleString("id-ID")}
                    </td>
                    <td colSpan="2" className="border px-2 py-1"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HutangPegawai;
