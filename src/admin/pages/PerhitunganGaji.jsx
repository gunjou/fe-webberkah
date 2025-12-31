/* eslint-disable jsx-a11y/anchor-is-valid */
import { React, useEffect, useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import "jspdf-autotable";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import api from "../../shared/Api";
import { PerhitunganGajiExportPDF } from "../components/PerhitunganGajiExportPDF";
import { PerhitunganGajiExportXLSX } from "../components/PerhitunganGajiExportXLSX";
import ModalRingkasanGaji from "../components/ModalRingkasanGaji";
import ModalBayarKasbon from "../components/ModalBayarKasbon";
import ModalBayarGaji from "../components/ModalBayarGaji";

const kolom = [
  { id: "nama", label: "Nama", minWidth: 120 },
  { id: "jenis_pegawai", label: "Jenis", minWidth: 80 },
  { id: "gaji_kotor", label: "Gaji Kotor", minWidth: 120 },
  { id: "total_potongan_estimasi", label: "Potongan", minWidth: 120 },
  { id: "gaji_bersih", label: "Gaji Bersih", minWidth: 120 },
  { id: "rekap_disiplin", label: "Rekap Disiplin", minWidth: 180 },
];

const headStyle = {
  backgroundColor: "#4d4d4d",
  color: "white",
  fontWeight: "bold",
  fontSize: "12px",
  padding: "4px 10px",
  whiteSpace: "nowrap",
};

const cellStyle = {
  fontSize: "12px",
  padding: "4px",
  whiteSpace: "nowrap",
};

const formatTerlambat = (menit) => {
  if (!menit || isNaN(menit)) return "-";
  const jam = Math.floor(menit / 60);
  const sisaMenit = menit % 60;
  if (jam > 0 && sisaMenit > 0) return `${jam} j ${sisaMenit} m`;
  if (jam > 0) return `${jam} j`;
  return `${sisaMenit} m`;
};

const PerhitunganGaji = () => {
  const [summary, setSummary] = useState({
    jumlah_karyawan: 0,
    total_gaji_kotor: 0,
    total_potongan: 0,
    total_gaji_bersih: 0,
  });

  const [absen, setAbsen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pegawaiList, setPegawaiList] = useState([]);
  const rowsPerPage = 50;
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [statusPembayaran, setStatusPembayaran] = useState({});
  const [selectedNamaList, setSelectedNamaList] = useState([]);
  // State baru (isi object {id_karyawan, nama})
  const [selectedPegawaiList, setSelectedPegawaiList] = useState([]);

  const [showModalRingkasanGaji, setShowModalRingkasanGaji] = useState(false);
  const handleOpenModal = () => setShowModalRingkasanGaji(true);
  const handleCloseModal = () => setShowModalRingkasanGaji(false);

  // State untuk modal bayar kasbon
  const [showBayarKasbon, setShowBayarKasbon] = useState(false);
  const handleOpenBayarModal = () => setShowBayarKasbon(true);
  const handleCloseBayarModal = () => setShowBayarKasbon(false);
  const [selectedPegawai, setSelectedPegawai] = useState("");
  const [hutangData, setHutangData] = useState(null);
  const [hutangLoading, setHutangLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [bayarData, setBayarData] = useState({
    nominal: "",
    keterangan: "",
  });

  // State untuk modal bayar gaji
  const [showBayarGajiModal, setShowBayarGajiModal] = useState(false);
  const [selectedJenisBayar, setSelectedJenisBayar] = useState(""); // gaji pokok, tunjangan, dll
  const [gajiRingkasan, setGajiRingkasan] = useState([]);
  const [totalsTerpilih, setTotalsTerpilih] = useState({
    gaji: 0,
    lembur: 0,
    tunjangan: 0,
  });

  const handleOpenBayarGajiModal = () => {
    const sections = getFilteredSections();
    setGajiRingkasan(sections);

    const selectedTotals = calculateSelectedTotals(absen, selectedNamaList);
    setTotalsTerpilih(selectedTotals);

    setShowBayarGajiModal(true);
  };

  const handleCloseBayarGajiModal = () => {
    setShowBayarGajiModal(false);
    setSelectedJenisBayar("");
  };

  const [tipeFilter, setTipeFilter] = useState("semua");

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await api.get("/payroll/preview/masal", {
        params: {
          bulan: selectedMonth,
          tahun: selectedYear,
        },
      });

      setAbsen(res.data.data || []);

      setSummary({
        jumlah_karyawan: res.data.jumlah_karyawan,
        total_gaji_kotor: res.data.total_gaji_kotor,
        total_potongan: res.data.total_potongan_estimasi,
        total_gaji_bersih: res.data.total_gaji_bersih,
      });

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const totalGaji = absen.reduce(
    (acc, item) => {
      const gajiPokok =
        item.tipe === "pegawai tetap"
          ? item.gaji_pokok || 0
          : (item.gaji_pokok || 0) * (item.hari_optimal || 0); // pegawai tidak tetap pakai hari_optimal

      const potonganManual = item.potongan || 0;
      const potonganKetidakhadiran = item.potongan_ketidakhadiran || 0;

      const potongan =
        item.tipe === "pegawai tetap"
          ? potonganManual + potonganKetidakhadiran + (item.kasbon || 0)
          : potonganManual + (item.kasbon || 0); // hanya pegawai tetap pakai potongan_ketidakhadiran

      const gajiBersihManual =
        (item.gaji_kotor || 0) - potonganManual - (item.kasbon || 0);
      const lembur = item.total_bayaran_lembur || 0;
      const tunjangan = item.tunjangan_kehadiran || 0;

      if (item.tipe === "pegawai tetap") {
        acc.pokok.tetap += gajiPokok;
        acc.potongan.tetap += potongan;
        acc.bersih.tetap += gajiBersihManual;
        acc.tunjangan.tetap += tunjangan;
        acc.lembur.tetap += lembur;
        acc.total.tetap =
          acc.bersih.tetap + acc.lembur.tetap + acc.tunjangan.tetap;
      } else if (item.tipe === "pegawai tidak tetap") {
        acc.pokok.tidaktetap += gajiPokok;
        acc.potongan.tidaktetap += potongan;
        acc.bersih.tidaktetap += gajiBersihManual;
        acc.lembur.tidaktetap += lembur;
        acc.tunjangan.tidaktetap += tunjangan;
        acc.total.tidaktetap =
          acc.bersih.tidaktetap +
          acc.lembur.tidaktetap +
          acc.tunjangan.tidaktetap;
      }

      // Total agregat
      acc.pokok.total = acc.pokok.tetap + acc.pokok.tidaktetap;
      acc.potongan.total = acc.potongan.tetap + acc.potongan.tidaktetap;
      acc.bersih.total = acc.bersih.tetap + acc.bersih.tidaktetap;
      acc.lembur.total = acc.lembur.tetap + acc.lembur.tidaktetap;
      acc.tunjangan.total = acc.tunjangan.tetap + acc.tunjangan.tidaktetap;
      acc.total.total =
        acc.bersih.total + acc.lembur.total + acc.tunjangan.total;

      return acc;
    },
    {
      pokok: { tetap: 0, tidaktetap: 0, total: 0 },
      potongan: { tetap: 0, tidaktetap: 0, total: 0 },
      bersih: { tetap: 0, tidaktetap: 0, total: 0 },
      lembur: { tetap: 0, tidaktetap: 0, total: 0 },
      tunjangan: { tetap: 0, tidaktetap: 0, total: 0 },
      total: { tetap: 0, tidaktetap: 0, total: 0 },
    }
  );

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...absen].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const valueA = a[sortConfig.key] || "";
    const valueB = b[sortConfig.key] || "";
    if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const filteredData = absen.filter((item) => {
    const cocokNama = item.nama
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const cocokTipe =
      tipeFilter === "semua" || item.jenis_pegawai === tipeFilter;

    return cocokNama && cocokTipe;
  });

  // Ambil daftar pegawai
  const fetchPegawaiList = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/pegawai/berhutang", {
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

  // Fetch status pembayaran gaji (komponen apa saja yang sudah dibayar)
  const fetchStatusPembayaran = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(
        `/pembayaran-gaji/?bulan=${selectedMonth}&tahun=${selectedYear}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // bikin map: { [id_karyawan]: [komponen1, komponen2] }
      const statusMap = {};
      res.data.forEach((p) => {
        if (!statusMap[p.id_karyawan]) {
          statusMap[p.id_karyawan] = new Set();
        }
        p.detail.forEach((d) => {
          statusMap[p.id_karyawan].add(d.komponen);
        });
      });

      // convert Set → Array biar konsisten
      Object.keys(statusMap).forEach((id) => {
        statusMap[id] = Array.from(statusMap[id]);
      });

      setStatusPembayaran(statusMap);
    } catch (err) {
      console.error("Gagal fetch pembayaran:", err);
    }
  };

  const handleSelectPegawai = async (idPegawai) => {
    setSelectedPegawai(idPegawai);
    if (!idPegawai) {
      setHutangData(null);
      return;
    }

    setHutangLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await api.get(`/hutang/karyawan/${idPegawai}`, {
        params: { status_hutang: "belum lunas" }, // ✅ tambahkan filter
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === "success") {
        setHutangData(res.data.data);
      } else {
        setHutangData({ total_hutang: 0 });
      }
    } catch (err) {
      console.error("Error fetch hutang:", err);
      setHutangData({ total_hutang: 0 });
    }
    setHutangLoading(false);
  };

  const handleBayarHutang = async (e) => {
    e.preventDefault();
    if (!selectedPegawai || !bayarData.nominal) return;

    // 🔹 Validasi: nominal tidak boleh melebihi sisa_hutang
    if (hutangData && bayarData.nominal > hutangData.sisa_hutang) {
      alert(
        `Nominal pembayaran tidak boleh melebihi sisa hutang Rp.${hutangData.sisa_hutang},-`
      );
      return;
    }

    setSaving(true);
    const token = localStorage.getItem("token");

    try {
      const formData = new URLSearchParams();
      formData.append("id_karyawan", selectedPegawai);
      formData.append("nominal", bayarData.nominal);
      formData.append("metode", "potong gaji");
      formData.append("keterangan", bayarData.keterangan || "");

      await api.post("/hutang/pembayaran", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      alert("Pembayaran hutang berhasil");
      // 🔹 Refresh data tabel setelah bayar sukses
      const start = `01-${String(selectedMonth).padStart(
        2,
        "0"
      )}-${selectedYear}`;
      const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
      const end = `${String(lastDay).padStart(2, "0")}-${String(
        selectedMonth
      ).padStart(2, "0")}-${selectedYear}`;
      fetchData(start, end);

      // 🔹 Reset state & tutup modal
      handleCloseBayarModal();
      setBayarData({ nominal: "", keterangan: "" });
      setSelectedPegawai("");
      setHutangData(null);
    } catch (err) {
      console.error("Error bayar hutang:", err.response?.data || err);
      alert("Gagal melakukan pembayaran hutang");
    }

    setSaving(false);
  };

  const sudahDibayar = (pegawai, jenis) => {
    const komponen = statusPembayaran[pegawai.id_karyawan] || [];
    if (jenis === "gaji pokok")
      return (
        komponen.includes("gaji_pokok") || komponen.includes("gaji_bersih")
      );
    if (jenis === "pokok-tunjangan")
      return (
        komponen.includes("gaji_pokok") ||
        komponen.includes("gaji_bersih") ||
        komponen.includes("tunjangan")
      );
    if (jenis === "tunjangan") return komponen.includes("tunjangan");
    if (jenis === "lemburan") return komponen.includes("lembur");
    if (jenis === "seluruh upah")
      return (
        komponen.includes("gaji_pokok") ||
        komponen.includes("gaji_bersih") ||
        komponen.includes("tunjangan") ||
        komponen.includes("lembur")
      );
    return false;
  };

  const getFilteredSections = () => {
    let filteredRows = [];

    if (tipeFilter === "semua") {
      // pakai selected kalau ada
      if (selectedNamaList.length > 0) {
        filteredRows = absen.filter((item) =>
          selectedNamaList.includes(item.nama)
        );
      } else {
        filteredRows = absen; // semua pegawai
      }
    } else {
      // selain "semua"
      if (selectedNamaList.length > 0) {
        filteredRows = filteredData.filter((item) =>
          selectedNamaList.includes(item.nama)
        );
      } else {
        filteredRows = filteredData; // semua hasil filter tipe
      }
    }

    // Total Gaji Pokok / Bersih Tanpa Lembur
    const totalGajiTanpaLembur = filteredRows.reduce(
      (acc, item) => acc + (item.gaji_bersih_tanpa_lembur || 0),
      0
    );

    // Tunjangan Kehadiran
    const totalTunjangan = filteredRows.reduce(
      (acc, item) => acc + (item.tunjangan_kehadiran || 0),
      0
    );

    // Total Gaji (Gaji + Tunjangan)
    const gajiPlusTunjangan = totalGajiTanpaLembur;

    // Total Lembur
    const totalLembur = filteredRows.reduce(
      (acc, item) => acc + (item.total_bayaran_lembur || 0),
      0
    );

    // Total Gaji Bersih (Gaji + Tunjangan + Lembur)
    const totalGajiBersih = gajiPlusTunjangan + totalLembur;

    return [
      {
        title:
          tipeFilter === "semua"
            ? selectedNamaList.length > 0
              ? "Ringkasan Gaji Terpilih"
              : "Ringkasan Semua Pegawai"
            : `Ringkasan Pegawai (${tipeFilter})`,
        data: [
          ["Tunjangan Kehadiran", totalTunjangan],
          ["Total Gaji (Gaji + Tunjangan)", gajiPlusTunjangan],
          ["Gaji Lembur", totalLembur],
          ["Total Gaji Bersih (Gaji + Tunjangan + Lembur)", totalGajiBersih],
        ],
      },
    ];
  };

  const calculateSelectedTotals = (absen, selectedNamaList) => {
    return absen.reduce(
      (acc, item) => {
        if (selectedNamaList.includes(item.nama)) {
          acc.gaji += item.gaji_kotor - item.kasbon - item.potongan || 0;
          acc.lembur += item.total_bayaran_lembur || 0;
          acc.tunjangan += item.tunjangan_kehadiran || 0;
        }
        return acc;
      },
      { gaji: 0, lembur: 0, tunjangan: 0 }
    );
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = searchTerm
    ? filteredData.slice(0, rowsPerPage)
    : filteredData.slice(indexOfFirstRow, indexOfLastRow);

  const getDateLabel = () => {
    const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString(
      "id-ID",
      { month: "long" }
    );
    return `Bulan ${monthName} ${selectedYear}`;
  };

  const getFileName = () => {
    const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString(
      "id-ID",
      { month: "long" }
    );

    if (selectedNamaList && selectedNamaList.length > 0) {
      return `Rekapan Gaji ${selectedNamaList.length} Pegawai Bulan ${monthName} ${selectedYear}`;
    }

    return `Rekapan Gaji Bulan ${monthName} ${selectedYear}`;
  };

  const handleCheckboxChange = (pegawai) => {
    // 1️⃣ State lama (nama saja)
    setSelectedNamaList((prev) =>
      prev.includes(pegawai.nama)
        ? prev.filter((n) => n !== pegawai.nama)
        : [...prev, pegawai.nama]
    );

    // 2️⃣ State baru (object lengkap)
    setSelectedPegawaiList((prev) => {
      const exists = prev.some((p) => p.id_karyawan === pegawai.id_karyawan);
      return exists
        ? prev.filter((p) => p.id_karyawan !== pegawai.id_karyawan)
        : [...prev, { id_karyawan: pegawai.id_karyawan, nama: pegawai.nama }];
    });
  };

  // Check/uncheck semua di currentRows
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // Pilih semua nama yang ada di currentRows
      const allNames = currentRows.map((item) => item.nama);
      setSelectedNamaList(allNames);

      // State baru → object
      const allPegawai = currentRows.map((item) => ({
        id_karyawan: item.id_karyawan,
        nama: item.nama,
      }));
      setSelectedPegawaiList(allPegawai);
    } else {
      // Kosongkan
      setSelectedNamaList([]);
      setSelectedPegawaiList([]);
    }
  };

  const totalGajiPokokTerpilih = currentRows
    .filter((item) => selectedNamaList.includes(item.nama))
    .reduce((acc, item) => {
      if (item.tipe === "pegawai tetap") {
        return acc + (item.gaji_pokok || 0);
      } else {
        // return acc + (item.gaji_pokok || 0) * (item.hari_optimal || 0);
        return acc + (item.gaji_pokok || 0) * (item.jumlah_hadir || 0);
      }
    }, 0);

  const totalPotonganTerpilih = currentRows
    .filter((item) => selectedNamaList.includes(item.nama))
    .reduce((acc, item) => {
      if (item.tipe === "pegawai tetap") {
        return (
          acc + ((item.potongan || 0) + (item.potongan_ketidakhadiran || 0))
        );
      } else {
        return acc + (item.potongan || 0);
      }
    }, 0);

  const totalGajiTerpilih = currentRows
    .filter((item) => selectedNamaList.includes(item.nama))
    .reduce(
      (acc, item) => acc + (item.gaji_kotor - item.kasbon - item.potongan || 0),
      0
    );

  const totalTunjanganTerpilih = currentRows
    .filter((item) => selectedNamaList.includes(item.nama))
    .reduce((acc, item) => acc + (item.tunjangan_kehadiran || 0), 0);

  const totalLemburanTerpilih = currentRows
    .filter((item) => selectedNamaList.includes(item.nama))
    .reduce((acc, item) => acc + (item.total_bayaran_lembur || 0), 0);

  // Tentukan data sumber
  const sourceData =
    tipeFilter === "semua"
      ? selectedNamaList.length > 0
        ? currentRows.filter((row) => selectedNamaList.includes(row.nama))
        : absen
      : selectedNamaList.length > 0
      ? filteredData.filter((row) => selectedNamaList.includes(row.nama))
      : filteredData;

  // hitung total berdasarkan sourceData
  const totals = {
    gaji_pokok: sourceData.reduce((sum, row) => sum + (row.gaji_pokok || 0), 0),
    tunjangan_kehadiran: sourceData.reduce(
      (sum, row) => sum + (row.tunjangan_kehadiran || 0),
      0
    ),
    potongan: sourceData.reduce((sum, row) => sum + (row.potongan || 0), 0),
    kasbon: sourceData.reduce((sum, row) => sum + (row.kasbon || 0), 0),
    total_gaji: sourceData.reduce(
      (sum, row) => sum + (row.gaji_bersih_tanpa_lembur || 0),
      0
    ),
    total_bayaran_lembur: sourceData.reduce(
      (sum, row) => sum + (row.total_bayaran_lembur || 0),
      0
    ),
    gaji_bersih: sourceData.reduce(
      (sum, row) => sum + (row.gaji_bersih || 0),
      0
    ),
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

  const singkatTipe = (tipe) => {
    if (tipe === "pegawai tetap") return "PT";
    if (tipe === "pegawai tidak tetap") return "PTT";
    return tipe;
  };

  // Fungsi untuk menentukan style highlight berdasarkan status pembayaran
  const highlightStyle = (id_karyawan, komponen) => {
    const isPaid = statusPembayaran[id_karyawan]?.includes(komponen);
    if (!isPaid) return {};

    return {
      fontWeight: "bold",
      color: "white",
      backgroundColor: "#4CAF50", // hijau solid
      borderRadius: "6px",
      padding: "2px 6px",
      display: "inline-block",
      cursor: "pointer",
    };
  };

  // Tambahkan useEffect untuk fetch otomatis saat tanggal berubah
  useEffect(() => {
    const start = `01-${String(selectedMonth).padStart(
      2,
      "0"
    )}-${selectedYear}`;
    const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
    const end = `${String(lastDay).padStart(2, "0")}-${String(
      selectedMonth
    ).padStart(2, "0")}-${selectedYear}`;
    fetchData(start, end);
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (!showBayarKasbon) {
      const start = `01-${String(selectedMonth).padStart(
        2,
        "0"
      )}-${selectedYear}`;
      const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
      const end = `${String(lastDay).padStart(2, "0")}-${String(
        selectedMonth
      ).padStart(2, "0")}-${selectedYear}`;
      fetchData(start, end);
    }
  }, [showBayarKasbon]);

  useEffect(() => {
    fetchPegawaiList();
  }, []);

  useEffect(() => {
    fetchStatusPembayaran();
  }, [selectedMonth, selectedYear]);

  return (
    <div className="Perhitungan Gaji">
      <div className="flex">
        <div className="w-full h-full">
          <div className="title flex text-2xl pt-4 pl-4 font-bold">
            Perhitungan Gaji
          </div>
          <div className="tabel rounded-[20px] mt-2 ml-4 mr-12 shadow-md bg-white h-full">
            <div className="ml-2 mb-2 pt-4 flex items-start justify-start gap-4 flex-wrap">
              <div className="">
                <span className="text-sm font-semibold">
                  Detail Gaji Pegawai Berkah Angsana
                </span>
                <div className="flex gap-2 mt-2">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="px-2 py-1 border rounded-lg text-sm"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString("id-ID", {
                          month: "long",
                        })}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="px-2 py-1 border rounded-lg text-sm"
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

                  <select
                    value={tipeFilter}
                    onChange={(e) => setTipeFilter(e.target.value)}
                    className="border rounded-lg px-2 py-1 text-sm"
                  >
                    <option value="semua">Semua Tipe</option>
                    <option value="tetap">Pegawai Tetap</option>
                    <option value="harian">Pegawai Harian</option>
                    <option value="magang">Pegawai Magang</option>
                  </select>

                  <div className="flex items-center ml-4 justify-end space-x-2 flex-wrap w-full">
                    <input
                      type="text"
                      className="block p-4 text-sm text-gray-900 border border-gray-300 rounded-[20px] w-50 h-9 bg-gray-50"
                      placeholder="Search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <button
                      type="button"
                      className="flex items-center text-[12px] bg-green-500 text-white hover:bg-green-700 rounded-[20px] px-4 py-2"
                      onClick={() =>
                        PerhitunganGajiExportXLSX({
                          filteredData,
                          selectedNamaList,
                          totalGajiTerpilih,
                          totalLemburanTerpilih,
                          getFileName,
                          getFilteredSections,
                          toTitleCase,
                          singkatTipe,
                          formatTerlambat,
                          formatRupiah,
                        })
                      }
                    >
                      <span className="text-xs pr-2">
                        <FaFileExcel />
                      </span>
                      Unduh Excel
                    </button>
                    <button
                      type="button"
                      className="flex items-center text-[12px] bg-red-700 text-white hover:bg-red-500 rounded-[20px] px-4 py-2"
                      onClick={() =>
                        PerhitunganGajiExportPDF({
                          kolom,
                          filteredData,
                          selectedNamaList,
                          getDateLabel,
                          getFileName,
                          getFilteredSections,
                          toTitleCase,
                          singkatTipe,
                          formatTerlambat,
                          formatRupiah,
                        })
                      }
                    >
                      <span className="text-xs pr-2">
                        <FaFilePdf />
                      </span>
                      Unduh PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-2 pl-2 flex-1 pb-1">
              <div className="rounded-lg shadow-md overflow-y-auto mr-2">
                <Paper sx={{ maxWidth: "100%", overflow: "hidden" }}>
                  <TableContainer
                    sx={{
                      maxHeight: 300,
                      maxWidth: 1120,
                      width: "100%",
                      overflowX: "auto",
                      tableLayout: "fixed",
                    }}
                  >
                    <Table
                      stickyHeader
                      sx={{
                        minWidth: 1000,
                        width: "100%",
                        borderCollapse: "separate",
                        borderSpacing: 0,
                      }}
                    >
                      {/* ================= TABLE HEAD ================= */}
                      <TableHead>
                        <TableRow sx={{ height: 36 }}>
                          {/* Checkbox */}
                          <TableCell
                            sx={{
                              ...headStyle,
                              width: 36,
                              textAlign: "center",
                              padding: "0 6px",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={
                                selectedNamaList.length ===
                                  currentRows.length && currentRows.length > 0
                              }
                              onChange={handleSelectAll}
                            />
                          </TableCell>

                          {/* Nama */}
                          <TableCell
                            sx={{
                              ...headStyle,
                              minWidth: 160,
                              maxWidth: 180,
                              textTransform: "capitalize",
                            }}
                          >
                            Nama
                          </TableCell>

                          {/* Jenis Pegawai */}
                          <TableCell
                            sx={{
                              ...headStyle,
                              minWidth: 90,
                              maxWidth: 100,
                            }}
                            align="center"
                          >
                            Pegawai
                          </TableCell>

                          {/* Gaji Kotor */}
                          <TableCell
                            sx={{
                              ...headStyle,
                              minWidth: 120,
                              maxWidth: 130,
                            }}
                            align="right"
                          >
                            Gaji Kotor
                          </TableCell>

                          {/* Potongan */}
                          <TableCell
                            sx={{
                              ...headStyle,
                              minWidth: 120,
                              maxWidth: 130,
                            }}
                            align="right"
                          >
                            Potongan
                          </TableCell>

                          {/* Gaji Bersih */}
                          <TableCell
                            sx={{
                              ...headStyle,
                              minWidth: 120,
                              maxWidth: 130,
                            }}
                            align="right"
                          >
                            Gaji Bersih
                          </TableCell>

                          {/* Rekap Disiplin */}
                          <TableCell
                            sx={{
                              ...headStyle,
                              minWidth: 180,
                              maxWidth: 220,
                            }}
                          >
                            Rekap Disiplin
                          </TableCell>
                        </TableRow>
                      </TableHead>

                      {/* ================= TABLE BODY ================= */}
                      <TableBody>
                        {currentRows.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              sx={{
                                fontSize: 12,
                                padding: "10px",
                                textAlign: "center",
                                color: "#777",
                              }}
                            >
                              Tidak ada data
                            </TableCell>
                          </TableRow>
                        ) : (
                          <>
                            {currentRows.map((item, index) => (
                              <TableRow
                                key={item.id_karyawan}
                                sx={{
                                  height: 34,
                                  backgroundColor:
                                    index % 2 === 0 ? "#fafafa" : "white",
                                  "&:hover": {
                                    backgroundColor: "#f1f5f9",
                                  },
                                }}
                              >
                                <TableCell align="center" sx={cellStyle}>
                                  <input
                                    type="checkbox"
                                    checked={selectedNamaList.includes(
                                      item.nama
                                    )}
                                    onChange={() => handleCheckboxChange(item)}
                                  />
                                </TableCell>

                                <TableCell
                                  sx={{
                                    ...cellStyle,
                                    fontWeight: 500,
                                    textTransform: "capitalize",
                                  }}
                                >
                                  {item.nama}
                                </TableCell>

                                <TableCell
                                  sx={{
                                    ...cellStyle,
                                    textTransform: "capitalize",
                                  }}
                                  align="center"
                                >
                                  {item.jenis_pegawai}
                                </TableCell>

                                <TableCell sx={cellStyle} align="right">
                                  {formatRupiah(item.gaji_kotor)}
                                </TableCell>

                                <TableCell
                                  sx={{ ...cellStyle, color: "#d32f2f" }}
                                  align="right"
                                >
                                  {formatRupiah(item.total_potongan_estimasi)}
                                </TableCell>

                                <TableCell
                                  sx={{ ...cellStyle, fontWeight: 600 }}
                                  align="right"
                                >
                                  {formatRupiah(item.gaji_bersih)}
                                </TableCell>

                                <TableCell
                                  sx={{
                                    fontSize: 12,
                                    padding: "6px 8px",
                                    color: "#555",

                                    whiteSpace: "normal", // 🔥 boleh ngenter
                                    wordBreak: "break-word", // 🔥 pecah kata panjang
                                    lineHeight: 1.4,

                                    maxWidth: 220, // 🔒 biar tidak melebar
                                  }}
                                >
                                  {item.rekap_disiplin || "-"}
                                </TableCell>
                              </TableRow>
                            ))}

                            {/* ================= TOTAL ROW ================= */}
                            <TableRow
                              sx={{
                                backgroundColor: "#eef2f7",
                                position: "sticky",
                                bottom: 0,
                                zIndex: 2,
                                borderTop: "2px solid #cbd5e1",
                                "& td": {
                                  fontWeight: 700,
                                  fontSize: 12,
                                  paddingTop: "8px",
                                  paddingBottom: "8px",
                                },
                              }}
                            >
                              <TableCell colSpan={3} align="center">
                                TOTAL
                              </TableCell>

                              <TableCell align="right">
                                {formatRupiah(summary.total_gaji_kotor)}
                              </TableCell>

                              <TableCell
                                align="right"
                                sx={{ color: "#d32f2f" }}
                              >
                                {formatRupiah(summary.total_potongan)}
                              </TableCell>

                              <TableCell align="right">
                                {formatRupiah(summary.total_gaji_bersih)}
                              </TableCell>

                              <TableCell />
                            </TableRow>
                          </>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </div>
              <div className="mt-4 mb-4 flex justify-start space-x-2">
                {/* Tombol Bayar Gaji */}
                <button
                  onClick={() => setShowBayarGajiModal(true)}
                  className="bg-[#4CAF50] text-white px-4 py-2 rounded-[20px] text-sm hover:bg-green-600 shadow flex items-center gap-2"
                >
                  {/* <FaPlus /> Bayar Gaji */}
                  Bayar Gaji
                </button>

                {/* Tombol Bayar Kasbon selalu tampil */}
                <button
                  onClick={handleOpenBayarModal}
                  className="bg-orange-600 text-white px-4 py-2 rounded-[20px] text-sm hover:bg-orange-700"
                >
                  Bayar Kasbon
                </button>

                {/* Tombol Lihat Ringkasan Gaji hanya tampil kalau tidak ada pegawai dipilih */}
                {/* <button
                  onClick={handleOpenModal}
                  className="bg-blue-600 text-white px-4 py-2 rounded-[20px] text-sm hover:bg-blue-700"
                >
                  Lihat Ringkasan Gaji
                </button> */}
              </div>

              {/* Modal Bayar Gaji */}
              {showBayarGajiModal && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
                  onClick={handleCloseBayarGajiModal} // klik backdrop → close modal
                >
                  <div
                    className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg"
                    onClick={(e) => e.stopPropagation()} // klik isi modal → tidak close
                  >
                    <ModalBayarGaji
                      setPegawaiList={setPegawaiList}
                      gajiRingkasan={gajiRingkasan}
                      selectedNamaList={selectedNamaList}
                      selectedJenisBayar={selectedJenisBayar}
                      setSelectedJenisBayar={setSelectedJenisBayar}
                      totalGajiTerpilih={totalGajiTerpilih}
                      totalLemburanTerpilih={totalLemburanTerpilih}
                      totalTunjanganTerpilih={totalTunjanganTerpilih}
                      selectedPegawaiList={selectedPegawaiList}
                      sudahDibayar={sudahDibayar}
                      setStatusPembayaran={setStatusPembayaran}
                      selectedMonth={selectedMonth}
                      selectedYear={selectedYear}
                      api={api}
                      handleCloseBayarGajiModal={handleCloseBayarGajiModal}
                      fetchData={fetchData}
                      toTitleCase={toTitleCase}
                    />
                  </div>
                </div>
              )}

              {/* Modal Ringkasan Gaji */}
              {showModalRingkasanGaji && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black bg-opacity-50"
                  onClick={handleCloseModal}
                >
                  <div
                    className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ModalRingkasanGaji
                      totalGaji={totalGaji}
                      formatRupiah={formatRupiah}
                      handleCloseModal={handleCloseModal}
                    />
                  </div>
                </div>
              )}

              {/* Modal Bayar Kasbon */}
              {showBayarKasbon && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
                  onClick={handleCloseBayarModal} // klik backdrop → close modal
                >
                  <div
                    className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg"
                    onClick={(e) => e.stopPropagation()} // klik isi modal → tidak close
                  >
                    <ModalBayarKasbon setShowBayarKasbon={setShowBayarKasbon} />
                  </div>
                </div>
              )}
              {/* Move buttons below pagination */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerhitunganGaji;
