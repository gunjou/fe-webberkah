import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import api from "../../shared/Api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FaPlus, FaFileExcel, FaFilePdf } from "react-icons/fa";

const HutangPegawai = () => {
  const [pegawaiList, setPegawaiList] = useState([]);
  const [selectedPegawai, setSelectedPegawai] = useState("");
  const [hutangList, setHutangList] = useState([]);
  const [loading, setLoading] = useState(false);

  // State filter
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1);
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [selectedStatus, setSelectedStatus] = useState("belum lunas");

  // State modal tambah hutang
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id_karyawan: "",
    tanggal: dayjs().format("YYYY-MM-DD"),
    nominal: "",
    keterangan: "",
  });
  const [saving, setSaving] = useState(false);

  // State edit hutang
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const [showBayarModal, setShowBayarModal] = useState(false);
  const [bayarData, setBayarData] = useState({
    id_karyawan: "",
    id_hutang: "",
    nominal: "",
    metode: "",
    keterangan: "",
  });

  // State untuk modal riwayat pembayaran
  const [showRiwayatModal, setShowRiwayatModal] = useState(false);
  const [riwayatData, setRiwayatData] = useState([]);
  const [riwayatLoading, setRiwayatLoading] = useState(false);

  // Helper format ke rupiah
  const formatRupiah = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("id-ID").format(value);
  };

  // Helper untuk ambil angka asli
  const parseNumber = (value) => {
    return Number(value.replace(/\D/g, "")) || 0;
  };

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
          id_karyawan: parseInt(formData.id_karyawan),
          nominal: parseInt(formData.nominal),
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

  // Edit hutang
  const handleEditHutang = async (e) => {
    e.preventDefault();
    if (!editData) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      // bikin formData biar sesuai dokumentasi
      const formData = new FormData();
      formData.append("nominal", editData.nominal);
      formData.append("keterangan", editData.keterangan);
      formData.append("status_hutang", editData.status_hutang);

      await api.put(`/hutang/${editData.id_hutang}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Hutang berhasil diperbarui ✅");

      // update data di tabel tanpa reload
      setHutangList((prev) =>
        prev.map((h) =>
          h.id_hutang === editData.id_hutang
            ? {
                ...h,
                nominal: editData.nominal,
                keterangan: editData.keterangan,
                status_hutang: editData.status_hutang,
              }
            : h
        )
      );

      setShowEditModal(false);
    } catch (error) {
      console.error(
        "Gagal edit hutang:",
        error.response?.data || error.message
      );
      alert("Gagal memperbarui hutang ❌");
    } finally {
      setSaving(false);
    }
  };

  // Hapus hutang
  const handleDeleteHutang = async (id) => {
    if (!window.confirm("Yakin ingin menghapus hutang ini?")) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/hutang/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Hutang berhasil dihapus ✅");
      fetchHutangList();
    } catch (error) {
      console.error("Gagal hapus hutang:", error);
      alert("Gagal menghapus hutang ❌");
    }
  };

  // --- FUNCTION BAYAR HUTANG ---
  const handleBayarHutang = async (e) => {
    e.preventDefault();
    if (!bayarData.id_karyawan || !bayarData.nominal || !bayarData.metode) {
      alert("Pegawai, nominal, dan metode wajib diisi!");
      return;
    }
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      await api.post(
        "/hutang/pembayaran",
        {
          ...bayarData,
          id_karyawan: parseInt(bayarData.id_karyawan),
          nominal: parseInt(bayarData.nominal),
          id_hutang: bayarData.id_hutang ? parseInt(bayarData.id_hutang) : null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Pembayaran hutang berhasil ✅");
      setShowBayarModal(false);
      fetchHutangList();
    } catch (error) {
      console.error("Gagal bayar hutang:", error);
      alert("Gagal melakukan pembayaran ❌");
    } finally {
      setSaving(false);
    }
  };

  // Fungsi ambil riwayat pembayaran berdasarkan id_hutang
  const fetchRiwayatPembayaran = async (idHutang) => {
    setRiwayatLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await api.get(`/hutang/pembayaran?id_hutang=${idHutang}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === "success") {
        setRiwayatData(res.data.data);
      } else {
        setRiwayatData([]);
      }
    } catch (err) {
      console.error("Gagal ambil riwayat pembayaran:", err);
      setRiwayatData([]);
    } finally {
      setRiwayatLoading(false);
    }
  };

  // Fungsi untuk membuka modal riwayat
  const handleOpenRiwayatModal = (idHutang) => {
    fetchRiwayatPembayaran(idHutang);
    setShowRiwayatModal(true);
  };

  // Filter data
  const filteredHutang = hutangList.filter((item) => {
    const itemDate = dayjs(item.tanggal);

    // Filter pegawai
    const matchPegawai = selectedPegawai
      ? item.id_karyawan === Number(selectedPegawai)
      : true;

    // Filter status
    const matchStatus = selectedStatus
      ? item.status_hutang === selectedStatus
      : true;

    // Filter bulan & tahun
    // Jika hutang belum lunas, tetap tampil meskipun bulan/tahun tidak sesuai
    const matchMonthYear =
      item.status_hutang === "belum lunas"
        ? true
        : (selectedMonth
            ? itemDate.month() + 1 === Number(selectedMonth)
            : true) &&
          (selectedYear ? itemDate.year() === Number(selectedYear) : true);

    return matchPegawai && matchStatus && matchMonthYear;
  });

  // Hitung total hutang
  const totalHutang = filteredHutang.reduce(
    (sum, item) => sum + (item.nominal || 0),
    0
  );

  // Hitung total dibayarkan dan sisa hutang dari filteredHutang
  const totalDibayarkan = filteredHutang.reduce(
    (sum, item) => sum + (item.hutang_terbayarkan || 0),
    0
  );

  const totalSisaHutang = filteredHutang.reduce(
    (sum, item) => sum + ((item.nominal || 0) - (item.hutang_terbayarkan || 0)),
    0
  );

  // Fungsi kapitalisasi
  const capitalize = (text) =>
    text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : "";

  // Hitung total hutang
  const getTotalHutang = () =>
    filteredHutang.reduce((sum, item) => sum + Number(item.nominal || 0), 0);

  // Fungsi deskripsi filter
  const getFilterDescription = () => {
    const bulanNama = selectedMonth
      ? dayjs(`${selectedYear}-${selectedMonth}-01`).format("MMMM YYYY")
      : "Semua Waktu";
    const pegawaiNama = selectedPegawai
      ? pegawaiList.find((p) => p.id_karyawan === selectedPegawai)?.nama
      : "Semua Pegawai";
    const status = selectedStatus ? selectedStatus : "Semua Status";

    return `Periode: ${capitalize(bulanNama)} | Pegawai: ${capitalize(
      pegawaiNama
    )} | Status: ${capitalize(status)}`;
  };

  // Export Excel
  const exportToExcel = () => {
    const worksheetData = filteredHutang.map((item, index) => ({
      No: index + 1,
      Nama: capitalize(item.nama),
      Tanggal: item.tanggal,
      Nominal: item.nominal,
      Keterangan: item.keterangan,
      Status: capitalize(item.status_hutang),
    }));

    const ws = XLSX.utils.json_to_sheet([]);
    const filterDesc = getFilterDescription();

    // Tambahkan judul + filter deskripsi
    XLSX.utils.sheet_add_aoa(ws, [["Data Hutang Pegawai"]], { origin: "A1" });
    XLSX.utils.sheet_add_aoa(ws, [[filterDesc]], { origin: "A2" });

    // Tambahkan data tabel
    XLSX.utils.sheet_add_json(ws, worksheetData, {
      origin: "A4", // tabel mulai baris ke-4
      skipHeader: false,
    });

    // Tambahkan total hutang di bawah tabel
    const totalHutang = getTotalHutang();
    XLSX.utils.sheet_add_aoa(
      ws,
      [["", "", "Total Hutang", `Rp ${totalHutang.toLocaleString("id-ID")}`]],
      { origin: -1 }
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hutang Pegawai");
    XLSX.writeFile(wb, "hutang_pegawai.xlsx");
  };

  // Export PDF
  const exportToPDF = () => {
    // Landscape mode
    const doc = new jsPDF("landscape");
    const filterDesc = getFilterDescription();

    // Tambahkan judul
    doc.setFontSize(14);
    doc.text("Data Hutang Pegawai", 14, 15);

    // Tambahkan filter description
    doc.setFontSize(10);
    doc.text(filterDesc, 14, 25);

    const tableColumn = [
      "No",
      "Nama",
      "Tanggal",
      "Nominal",
      "Keterangan",
      "Status",
    ];
    const tableRows = [];

    filteredHutang.forEach((item, index) => {
      tableRows.push([
        index + 1,
        capitalize(item.nama),
        item.tanggal,
        item.nominal.toLocaleString("id-ID"),
        item.keterangan,
        capitalize(item.status_hutang),
      ]);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 35, // mulai setelah judul + filter
    });

    // Tambahkan total hutang di bawah tabel
    const totalHutang = getTotalHutang();
    doc.setFontSize(12);
    doc.text(
      `Total Hutang: Rp ${totalHutang.toLocaleString("id-ID")}`,
      14,
      doc.lastAutoTable.finalY + 15
    );

    doc.save("hutang_pegawai.pdf");
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold">Daftar Hutang</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-[20px] text-sm shadow"
        >
          <FaPlus /> Tambah Hutang
        </button>
      </div>
      {/* Modal Tambah Hutang */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)} // klik di luar modal
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()} // mencegah klik di dalam modal menutup
          >
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
                type="text"
                placeholder="Nominal"
                value={
                  formData.nominal
                    ? `Rp. ${formatRupiah(formData.nominal)}`
                    : ""
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nominal: parseNumber(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border rounded-lg text-sm text-left"
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
                  className="px-4 py-2 bg-gray-400 text-white rounded-[20px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-[20px]"
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showBayarModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={() => setShowBayarModal(false)} // klik di luar modal
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()} // mencegah klik di dalam modal menutup
          >
            <h3 className="text-xl font-bold mb-4">Bayar Hutang</h3>
            <form onSubmit={handleBayarHutang} className="space-y-3">
              <input
                type="text"
                placeholder="Nominal"
                value={
                  bayarData.nominal
                    ? `Rp. ${formatRupiah(bayarData.nominal)}`
                    : ""
                }
                onChange={(e) =>
                  setBayarData({
                    ...bayarData,
                    nominal: parseNumber(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border rounded-lg text-sm text-left"
                required
              />

              <select
                value={bayarData.metode}
                onChange={(e) =>
                  setBayarData({ ...bayarData, metode: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              >
                <option value="">Pilih Metode</option>
                <option value="tunai">Tunai</option>
                <option value="potong gaji">Potong Gaji</option>
              </select>

              <input
                type="text"
                placeholder="Keterangan"
                value={bayarData.keterangan}
                onChange={(e) =>
                  setBayarData({ ...bayarData, keterangan: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBayarModal(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded-[20px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-[20px]"
                >
                  {saving ? "Menyimpan..." : "Bayar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Edit Hutang */}
      {showEditModal && editData && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={() => setShowEditModal(false)} // klik di luar modal
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()} // mencegah klik di dalam modal menutup
          >
            <h3 className="text-xl font-bold mb-4">Edit Hutang</h3>
            <form onSubmit={handleEditHutang} className="space-y-3">
              <select
                value={editData.id_karyawan}
                onChange={(e) =>
                  setEditData({ ...editData, id_karyawan: e.target.value })
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
                value={editData.tanggal}
                onChange={(e) =>
                  setEditData({ ...editData, tanggal: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              />

              <input
                type="text"
                placeholder="Nominal"
                value={
                  editData.nominal
                    ? `Rp. ${formatRupiah(editData.nominal)}`
                    : ""
                }
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    nominal: parseNumber(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border rounded-lg text-sm text-left"
                required
              />

              <input
                type="text"
                placeholder="Keterangan"
                value={editData.keterangan}
                onChange={(e) =>
                  setEditData({ ...editData, keterangan: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded-[20px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-[20px]"
                >
                  {saving ? "Menyimpan..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Riwayat Pembayaran */}
      {showRiwayatModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={() => setShowRiwayatModal(false)} // klik di luar modal
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()} // mencegah klik di dalam modal menutup
          >
            <h3 className="text-xl font-bold mb-4">Riwayat Pembayaran</h3>

            {riwayatLoading ? (
              <p className="text-center">Memuat data...</p>
            ) : riwayatData.length === 0 ? (
              <p className="text-center text-gray-500">Belum ada pembayaran</p>
            ) : (
              <div className="overflow-y-auto max-h-64">
                <table className="w-full text-sm border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-2 py-1 text-xs">No</th>
                      <th className="border px-2 py-1 text-xs">Nominal</th>
                      <th className="border px-2 py-1 text-xs">Metode</th>
                      <th className="border px-2 py-1 text-xs">Keterangan</th>
                      <th className="border px-2 py-1 text-xs">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riwayatData.map((item, index) => (
                      <tr key={item.id_pembayaran}>
                        <td className="border px-2 py-1 text-center text-xs">
                          {index + 1}
                        </td>
                        <td className="border px-2 py-1 text-right text-xs">
                          Rp.{item.nominal.toLocaleString("id-ID")}
                        </td>
                        <td className="border px-2 py-1 text-xs capitalize">
                          {item.metode}
                        </td>
                        <td className="border px-2 py-1 text-xs">
                          {item.keterangan}
                        </td>
                        <td className="border px-2 py-1 text-xs">
                          {item.tanggal}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowRiwayatModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded-[20px]"
              >
                Tutup
              </button>
            </div>
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
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-[20px] text-sm shadow"
          >
            <FaFileExcel />
            Export Excel
          </button>

          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-[20px] text-sm shadow"
          >
            <FaFilePdf />
            Export PDF
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
                  <th className="border px-2 py-1 text-xs">Dibayarkan</th>
                  <th className="border px-2 py-1 text-xs">Sisa Hutang</th>
                  <th className="border px-2 py-1 text-xs">Keterangan</th>
                  <th className="border px-2 py-1 text-xs">Status</th>
                  <th className="border px-2 py-1 text-xs">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      Memuat data...
                    </td>
                  </tr>
                ) : filteredHutang.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-gray-500">
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
                      <td className="border px-2 py-1 text-right text-xs text-green-600">
                        Rp.{item.hutang_terbayarkan?.toLocaleString("id-ID")}
                      </td>
                      <td className="border px-2 py-1 text-right text-xs text-red-600">
                        Rp.{item.sisa_hutang?.toLocaleString("id-ID")}
                      </td>
                      <td className="border px-2 py-1 text-xs">
                        {item.keterangan}
                      </td>
                      <td
                        className={`border px-2 py-1 capitalize text-xs font-semibold ${
                          item.status_hutang === "lunas"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {item.status_hutang}
                      </td>

                      <td className="border px-2 py-1 text-center text-xs">
                        <button
                          onClick={() => handleOpenRiwayatModal(item.id_hutang)}
                          className="bg-indigo-500 text-white px-2 py-1 rounded mr-1"
                        >
                          Riwayat
                        </button>
                        <button
                          onClick={() => {
                            setEditData(item);
                            setShowEditModal(true);
                          }}
                          className="bg-yellow-400 text-white px-2 py-1 rounded mr-1"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteHutang(item.id_hutang)}
                          className="bg-red-500 text-white px-2 py-1 rounded mr-1"
                        >
                          Hapus
                        </button>
                        <button
                          onClick={() => {
                            setBayarData({
                              id_karyawan: item.id_karyawan,
                              id_hutang: item.id_hutang,
                              nominal: "",
                              metode: "",
                              keterangan: "",
                            });
                            setShowBayarModal(true);
                          }}
                          className="bg-green-500 text-white px-2 py-1 rounded"
                        >
                          Bayar
                        </button>
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
                    <td className="border px-2 py-1 text-right text-black">
                      Rp.{totalHutang.toLocaleString("id-ID")}
                    </td>
                    <td className="border px-2 py-1 text-right text-green-500">
                      Rp.{totalDibayarkan.toLocaleString("id-ID")}
                    </td>
                    <td className="border px-2 py-1 text-right text-red-500">
                      Rp.{totalSisaHutang.toLocaleString("id-ID")}
                    </td>
                    <td className="border px-2 py-1"></td>
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
