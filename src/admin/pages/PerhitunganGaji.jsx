/* eslint-disable jsx-a11y/anchor-is-valid */
import { React, useEffect, useState } from "react";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import Tooltip from "@mui/material/Tooltip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import api from "../../shared/Api";
import { FiX } from "react-icons/fi";

const kolom = [
  // { id: "no", label: "No", minWidth: 20 },
  { id: "nip", label: "NIP", minWidth: 20 },
  { id: "nama", label: "Nama", minWidth: 40 },
  { id: "tipe", label: "Tipe", minWidth: 20 },
  { id: "jumlah_hadir", label: "Hadir", minWidth: 10 },
  { id: "jumlah_izin", label: "Izin", minWidth: 10 },
  { id: "jumlah_sakit", label: "Sakit", minWidth: 10 },
  { id: "jumlah_alpha", label: "Alpha", minWidth: 10 },
  // { id: "total_jam_kerja", label: "Jam Kerja", minWidth: 50 },
  // { id: "jam_normal", label: "Normal", minWidth: 40 },
  //  { id: "jam_terlambat", label: "Terlambat", minWidth: 40 },
  { id: "jam_kurang", label: "Kurang", minWidth: 40 },
  { id: "gaji_pokok", label: "Gaji Pokok", minWidth: 50 },
  { id: "potongan", label: "Potongan", minWidth: 40 },
  { id: "kasbon", label: "Kasbon", minWidth: 40 },
  { id: "tunjangan_kehadiran", label: "Tunjangan", minWidth: 40 },
  { id: "gaji_bersih", label: "Total Gaji", minWidth: 50 },
  { id: "total_lembur", label: "Lembur", minWidth: 10 },
  { id: "total_menit_lembur", label: "Waktu Lembur", minWidth: 20 },
  { id: "total_bayaran_lembur", label: "Gaji Lembur", minWidth: 40 },
  { id: "total_gaji", label: "Gaji Bersih", minWidth: 40 },
  { id: "bank", label: "Bank", minWidth: 40 },
  { id: "no_rekening", label: "Norek", minWidth: 40 },
  { id: "an_rekening", label: "A.N. rek", minWidth: 60 },
];

const formatTerlambat = (menit) => {
  if (!menit || isNaN(menit)) return "-";
  const jam = Math.floor(menit / 60);
  const sisaMenit = menit % 60;
  if (jam > 0 && sisaMenit > 0) return `${jam} j ${sisaMenit} m`;
  if (jam > 0) return `${jam} j`;
  return `${sisaMenit} m`;
};

const PerhitunganGaji = () => {
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

  const [showModal, setShowModal] = useState(false);
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  // State untuk modal bayar kasbon
  const [showBayarModal, setShowBayarModal] = useState(false);
  const handleOpenBayarModal = () => setShowBayarModal(true);
  const handleCloseBayarModal = () => setShowBayarModal(false);
  const [selectedPegawai, setSelectedPegawai] = useState("");
  const [hutangData, setHutangData] = useState(null);
  const [hutangLoading, setHutangLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // state untuk loading saat submit bayar gaji
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const fetchData = (start = "", end = "") => {
    const token = localStorage.getItem("token");
    if (!start || !end) return;

    api
      .get("/perhitungan-gaji/rekapan", {
        params: { start, end }, // Kirim parameter start dan end (format dd-mm-yyyy)
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const sorted = res.data.data
          .filter((item) => item.nip)
          .sort((a, b) => a.nip - b.nip);
        // .filter((item) => item.nama)
        // .sort((a, b) => a.nama.localeCompare(b.nama));
        setAbsen(sorted);
        console.log("Data gaji:", sorted);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
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
    const start = `01-${String(selectedMonth).padStart(
      2,
      "0"
    )}-${selectedYear}`;
    const endDateObj = new Date(selectedYear, selectedMonth, 0); // last day of month
    const end = `${String(endDateObj.getDate()).padStart(2, "0")}-${String(
      selectedMonth
    ).padStart(2, "0")}-${selectedYear}`;
    fetchData(start, end);
  }, [selectedMonth, selectedYear]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

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

  const sortedData = [...absen].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const valueA = a[sortConfig.key] || "";
    const valueB = b[sortConfig.key] || "";
    if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const filteredData = sortedData.filter((item) => {
    const cocokNama = item.nama
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const cocokTipe =
      tipeFilter === "semua" || item.tipe.toLowerCase() === tipeFilter;
    return cocokNama && cocokTipe;
  });

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
        setHutangData(res.data);
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
      console.log("Status pembayaran:", statusMap);
    } catch (err) {
      console.error("Gagal fetch pembayaran:", err);
    }
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
    if (selectedNamaList.length > 0) {
      const filteredRows = absen.filter((item) =>
        selectedNamaList.includes(item.nama)
      );

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
          title: "Ringkasan Gaji Terpilih",
          data: [
            ["Tunjangan Kehadiran", totalTunjangan],
            ["Total Gaji (Gaji + Tunjangan)", gajiPlusTunjangan],
            ["Gaji Lembur", totalLembur],
            ["Total Gaji Bersih (Gaji + Tunjangan + Lembur)", totalGajiBersih],
          ],
        },
      ];
    }

    // Jika tidak ada pegawai terpilih, bisa kembalikan ringkasan semua pegawai
    const totalGajiTanpaLembur = totalGaji.bersih.total; // menggunakan gaji_bersih tanpa lembur
    const totalTunjangan = totalGaji.tunjangan.total;
    const gajiPlusTunjangan = totalGajiTanpaLembur + totalTunjangan;
    const totalLembur = totalGaji.lembur.total;
    const totalGajiBersih = totalGaji.total.total;

    return [
      {
        title: "Ringkasan Semua Pegawai",
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

  const nextPage = () => {
    if (currentPage < Math.ceil(absen.length / rowsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const formatTanggalSlash = (dateStr) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

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

  console.log("Selected Pegawai List:", selectedPegawaiList);

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
    console.log(tipe);
    if (tipe === "pegawai tetap") return "PT";
    if (tipe === "pegawai tidak tetap") return "PTT";
    return tipe;
  };

  const downloadExcel = () => {
    const confirmDownload = window.confirm(
      "Apakah Anda yakin ingin mengunduh data sebagai file Excel?"
    );
    if (!confirmDownload) return;

    const header = [
      // "No",
      "NIP",
      "Nama",
      "Tipe",
      "Jumlah Hadir",
      "Jumlah Izin",
      "Jumlah Sakit",
      "Jumlah Alpha",
      "Jam Kerja",
      "Jam Terlambat",
      "Gaji Pokok",
      "Potongan",
      "Tunjangan Kehadiran",
      "Gaji Bersih Tanpa Lembur",
      "Lembur",
      "Menit Lembur",
      "Bayaran Lembur",
      "Gaji Bersih",
      "Bank",
      "Norek",
      "A.N. Rek",
    ];

    // ✅ Gunakan selectedNamaList jika tersedia
    const dataUntukExcel =
      selectedNamaList && selectedNamaList.length > 0
        ? filteredData.filter((item) => selectedNamaList.includes(item.nama))
        : filteredData;

    const rows = dataUntukExcel.map((item, idx) => [
      // idx + 1,
      String(item.nip).padStart(3, "0"),
      toTitleCase(item.nama_panggilan),
      singkatTipe(item.tipe),
      item.jumlah_hadir ?? "-",
      item.jumlah_izin ?? "-",
      item.jumlah_sakit ?? "-",
      item.jumlah_alpha ?? "-",
      formatTerlambat(item.total_jam_kerja),
      formatTerlambat(item.jam_terlambat + item.jam_kurang),
      formatRupiah(item.gaji_pokok),
      formatRupiah(item.potongan),
      formatRupiah(item.tunjangan_kehadiran),
      formatRupiah(item.gaji_bersih_tanpa_lembur),
      item.total_lembur ?? "-",
      item.total_menit_lembur ?? "-",
      formatRupiah(item.total_bayaran_lembur),
      formatRupiah(item.gaji_bersih),
      item.bank ?? "-",
      item.no_rekening ?? "-",
      item.an_rekening ?? "-",
    ]);

    // ✅ Ringkasan dinamis tergantung apakah ada pegawai yang dipilih
    let summaryRows = [];

    if (selectedNamaList && selectedNamaList.length > 0) {
      // Ringkasan untuk pegawai yang dipilih
      summaryRows = [
        [],
        ["RINGKASAN TOTAL GAJI TERPILIH"],
        [],
        ["Total Gaji Bersih Terpilih", formatRupiah(totalGajiTerpilih)],
        ["Total Lemburan Terpilih", formatRupiah(totalLemburanTerpilih)],
        [
          "Total Gaji + Lemburan Terpilih",
          formatRupiah(totalGajiTerpilih + totalLemburanTerpilih),
        ],
      ];
    } else {
      // Ringkasan lengkap (semua pegawai)
      const sections = getFilteredSections();

      summaryRows = [[], ["RINGKASAN TOTAL GAJI"], []];

      sections.forEach((section) => {
        summaryRows.push([section.title]);
        section.data.forEach(([label, value]) => {
          summaryRows.push([label, formatRupiah(value)]);
        });
        summaryRows.push([]);
      });
    }

    // Gabungkan semua ke worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([
      header,
      ...rows,
      ...summaryRows,
    ]);

    worksheet["!cols"] = [
      // { wch: 5 }, // No
      { wch: 10 }, // NIP
      { wch: 20 }, // Nama
      { wch: 10 }, // Tipe
      { wch: 12 }, // Hadir
      { wch: 12 }, // Izin
      { wch: 12 }, // Sakit
      { wch: 12 }, // Alpha
      { wch: 15 }, // Jam Kerja
      { wch: 15 }, // Jam Terlambat
      { wch: 15 }, // Gaji Pokok
      { wch: 15 }, // Potongan
      { wch: 20 }, // Tunj. Kehadiran
      { wch: 20 }, // Gaji Bersih Tanpa Lembur
      { wch: 10 }, // Lembur
      { wch: 10 }, // Menit Lembur
      { wch: 20 }, // Bayaran Lembur
      { wch: 20 }, // Gaji Bersih
      { wch: 15 }, // Bank
      { wch: 20 }, // Norek
      { wch: 20 }, // A.N. Rek
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekapan Gaji");

    XLSX.writeFile(workbook, `${getFileName()}.xlsx`);
  };

  const downloadPDF = () => {
    const confirmDownload = window.confirm(
      "Apakah Anda yakin ingin mengunduh data sebagai file PDF?"
    );
    if (!confirmDownload) return;

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const title = "Rekapan Gaji - PT. Berkah Angsana Teknika";
    const dateStr = getDateLabel();

    doc.setFontSize(14);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.text(dateStr, 14, 22);

    const header = kolom.map((k) =>
      k.label
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );

    // ✅ GUNAKAN selectedNamaList jika tidak kosong
    const dataUntukPDF =
      selectedNamaList.length > 0
        ? filteredData.filter((item) => selectedNamaList.includes(item.nama))
        : filteredData;

    const rows = dataUntukPDF.map((item, idx) => [
      // idx + 1,
      String(item.nip).padStart(3, "0"),
      toTitleCase(item.nama_panggilan),
      singkatTipe(item.tipe),
      item.jumlah_hadir ?? "-",
      item.jumlah_izin ?? "-",
      item.jumlah_sakit ?? "-",
      item.jumlah_alpha ?? "-",
      formatTerlambat(item.jam_terlambat + item.jam_kurang),
      formatRupiah(item.gaji_pokok),
      "-" + formatRupiah(item.potongan),
      "-" + formatRupiah(item.kasbon),
      formatRupiah(item.tunjangan_kehadiran),
      formatRupiah(item.gaji_bersih_tanpa_lembur),
      item.total_lembur ?? "-",
      formatTerlambat(item.total_menit_lembur) ?? "-",
      formatRupiah(item.total_bayaran_lembur),
      formatRupiah(item.gaji_bersih),
      item.bank ?? "-",
      item.no_rekening ?? "-",
      item.an_rekening ?? "-",
    ]);

    doc.autoTable({
      head: [header],
      body: rows,
      startY: 30,
      margin: { left: 14, right: 6 },
      styles: {
        fontSize: 7,
        cellPadding: 1,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [139, 0, 0],
        textColor: [255, 255, 255],
        valign: "middle",
      },
      columnStyles: {
        // 0: { halign: "center", cellWidth: 5 }, // No
        0: { halign: "left", cellWidth: 10 }, // NIP
        1: { halign: "left", cellWidth: 12 }, // Nama
        2: { halign: "center", cellWidth: 8 }, // Tipe
        3: { halign: "center", cellWidth: 8 }, // Hadir
        4: { halign: "center", cellWidth: 8 }, // Izin
        5: { halign: "center", cellWidth: 8 }, // Sakit
        6: { halign: "center", cellWidth: 9 }, // Alpha
        7: { halign: "left", cellWidth: 12 }, // Terlambat
        8: { halign: "left", cellWidth: 18 }, // Gaji Pokok
        9: { halign: "left", cellWidth: 16 }, // Potongan
        10: { halign: "left", cellWidth: 16 }, // Kasbon
        11: { halign: "left", cellWidth: 16 }, // Tunj. Kehadiran
        12: { halign: "left", cellWidth: 18 }, // Gaji Bersih (tanpa lembur)
        13: { halign: "center", cellWidth: 8 }, // Total Lembur
        14: { halign: "left", cellWidth: 13 }, // Total Menit Lembur
        15: { halign: "left", cellWidth: 18 }, // Bayaran Lembur
        16: { halign: "left", cellWidth: 18 }, // Gaji Bersih
        17: { halign: "left", cellWidth: 10 }, // Bank
        18: { halign: "left", cellWidth: 23 }, // No Rekening
        19: { halign: "left", cellWidth: 28 }, // A.N. Rek
      },
      didParseCell: function (data) {
        // Kolom Sakit dan Izin (index ke-4 dan 5)
        if (
          data.section === "body" &&
          (data.column.index === 4 || data.column.index === 5)
        ) {
          if (parseInt(data.cell.text[0], 10) > 0) {
            data.cell.styles.textColor = [0, 0, 255]; // biru
          }
        }
        // Kolom Alpha (index ke-6)
        if (data.section === "body" && data.column.index === 6) {
          if (parseInt(data.cell.text[0], 10) > 0) {
            data.cell.styles.textColor = [255, 0, 0]; // merah
          }
        }
        // Kolom potongan dan kasbon (index ke-9 & 10)
        if (
          data.section === "body" &&
          (data.column.index === 9 || data.column.index === 10)
        ) {
          if (String(data.cell.text[0]).startsWith("-")) {
            data.cell.styles.textColor = [255, 0, 0];
          }
        }
      },
    });

    let y = doc.lastAutoTable.finalY + 10;

    const estimatedRingkasanHeight = 3 * (3 * 5 + 6 + 3);
    const pageHeight = doc.internal.pageSize.getHeight();

    if (y + estimatedRingkasanHeight > pageHeight - 10) {
      doc.addPage();
      y = 15;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Ringkasan Total Gaji", 14, y);
    y += 8;

    const sections = getFilteredSections();

    sections.forEach((section, idx) => {
      // Judul section lebih tebal
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(section.title, 14, y);
      y += 6;

      // Isi data
      section.data.forEach(([label, value]) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`${label}`, 20, y);

        doc.setFont("helvetica", "bold");
        doc.text(`${formatRupiah(value)}`, 100, y); // tetap dekat, bukan rata kanan jauh
        y += 5; // jarak antar baris kecil
      });

      // Jarak antar section sedikit lebih besar
      y += 4;
    });

    doc.save(`${getFileName()}.pdf`);
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
    if (!showBayarModal) {
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
  }, [showBayarModal]);

  // hanya sekali saat mount
  useEffect(() => {
    fetchPegawaiList();
  }, []);

  // setiap kali bulan/tahun berubah
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
                    <option value="pegawai tetap">Pegawai Tetap</option>
                    <option value="pegawai tidak tetap">
                      Pegawai Tidak Tetap
                    </option>
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
                      onClick={downloadExcel}
                    >
                      <span className="text-xs pr-2">
                        <FaFileExcel />
                      </span>
                      Unduh Excel
                    </button>
                    <button
                      type="button"
                      className="flex items-center text-[12px] bg-red-700 text-white hover:bg-red-500 rounded-[20px] px-4 py-2"
                      onClick={downloadPDF}
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
                    }}
                  >
                    <Table stickyHeader sx={{ minWidth: 1000, width: "100%" }}>
                      <TableHead className="bg-[#e8ebea]">
                        <TableRow sx={{ height: "26px" }}>
                          <TableCell
                            style={{
                              backgroundColor: "#4d4d4d",
                              color: "white",
                              fontWeight: "bold",
                              fontSize: "12px",
                              padding: "4px 10px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={
                                selectedNamaList.length ===
                                  currentRows.length && currentRows.length > 0
                              }
                              indeterminate={
                                selectedNamaList.length > 0 &&
                                selectedNamaList.length < currentRows.length
                              }
                              onChange={handleSelectAll}
                            />
                          </TableCell>

                          {kolom.map((column, index) => (
                            <TableCell
                              key={column.id}
                              onClick={() => handleSort(column.id)}
                              style={{
                                minWidth: column.minWidth,
                                backgroundColor: "#4d4d4d",
                                color: "white",
                                fontWeight: "bold",
                                fontSize: "12px",
                                padding: "4px 10px",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                textAlign: "left",
                                borderRadius: index === 19 ? "0 10px 0 0" : "0",
                              }}
                            >
                              {column.label}
                              {sortConfig.key === column.id && (
                                <span style={{ marginLeft: 4 }}>
                                  {sortConfig.direction === "asc" ? " ▲" : " ▼"}
                                </span>
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {currentRows.length === 0 ? (
                          <TableRow sx={{ height: "22px" }}>
                            <TableCell
                              colSpan={kolom.length}
                              align="left"
                              sx={{ fontSize: "12px", padding: "4px" }}
                            >
                              Tidak ada yang cocok dengan pencarian Anda.
                            </TableCell>
                          </TableRow>
                        ) : (
                          currentRows.map((item, index) => (
                            <TableRow key={index} sx={{ height: "22px" }}>
                              <TableCell align="center" sx={{ padding: "4px" }}>
                                <input
                                  type="checkbox"
                                  checked={selectedNamaList.includes(item.nama)}
                                  onChange={() => handleCheckboxChange(item)}
                                />
                              </TableCell>

                              {/* <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="center"
                              >
                                {index + 1}
                              </TableCell> */}
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="center"
                              >
                                {String(item.nip).padStart(3, "0")}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                className="capitalize"
                              >
                                {item.nama_panggilan}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="center"
                                className="capitalize"
                              >
                                {singkatTipe(item.tipe)}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="center"
                              >
                                {item.jumlah_hadir ?? "-"}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="center"
                              >
                                {item.jumlah_izin ?? "-"}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="center"
                              >
                                {item.jumlah_sakit ?? "-"}
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontSize: "12px",
                                  padding: "4px",
                                  color: "red",
                                }}
                                align="center"
                              >
                                {item.jumlah_alpha ?? "-"}
                              </TableCell>
                              {/* <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="center"
                              >
                                {formatTerlambat(item.total_jam_kerja)}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="center"
                              >
                                {formatTerlambat(item.jam_normal)}
                              </TableCell> */}
                              <TableCell
                                sx={{
                                  fontSize: "12px",
                                  padding: "4px",
                                  color: "red",
                                }}
                                align="center"
                              >
                                {formatTerlambat(
                                  item.jam_terlambat + item.jam_kurang
                                )}
                              </TableCell>
                              {/* <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="center"
                              >
                                {formatTerlambat(item.jam_kurang)}
                              </TableCell> */}
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="left"
                              >
                                {formatRupiah(item.gaji_pokok)}
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontSize: "12px",
                                  padding: "4px",
                                  color: "red",
                                  whiteSpace: "nowrap",
                                }}
                                align="left"
                              >
                                {"-" + formatRupiah(item.potongan)}
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontSize: "12px",
                                  padding: "4px",
                                  color: "red",
                                  whiteSpace: "nowrap",
                                }}
                                align="left"
                              >
                                {"-" + formatRupiah(item.kasbon)}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="left"
                              >
                                {statusPembayaran[item.id_karyawan]?.includes(
                                  "tunjangan"
                                ) ? (
                                  <Tooltip title="Terbayarkan" arrow>
                                    <span
                                      style={highlightStyle(
                                        item.id_karyawan,
                                        "tunjangan"
                                      )}
                                    >
                                      {formatRupiah(item.tunjangan_kehadiran)}
                                    </span>
                                  </Tooltip>
                                ) : (
                                  formatRupiah(item.tunjangan_kehadiran)
                                )}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="left"
                              >
                                {statusPembayaran[item.id_karyawan]?.includes(
                                  "gaji_pokok"
                                ) ||
                                statusPembayaran[item.id_karyawan]?.includes(
                                  "gaji_bersih"
                                ) ? (
                                  <Tooltip title="Terbayarkan" arrow>
                                    <span
                                      style={highlightStyle(
                                        item.id_karyawan,
                                        "gaji_pokok"
                                      )}
                                    >
                                      {formatRupiah(
                                        item.gaji_bersih_tanpa_lembur
                                      )}
                                    </span>
                                  </Tooltip>
                                ) : (
                                  formatRupiah(item.gaji_bersih_tanpa_lembur)
                                )}
                              </TableCell>

                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="center"
                              >
                                {item.total_lembur ?? "-"}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="center"
                              >
                                {formatTerlambat(item.total_menit_lembur) ??
                                  "-"}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="left"
                              >
                                {statusPembayaran[item.id_karyawan]?.includes(
                                  "lembur"
                                ) ? (
                                  <Tooltip title="Terbayarkan" arrow>
                                    <span
                                      style={highlightStyle(
                                        item.id_karyawan,
                                        "lembur"
                                      )}
                                    >
                                      {formatRupiah(item.total_bayaran_lembur)}
                                    </span>
                                  </Tooltip>
                                ) : (
                                  formatRupiah(item.total_bayaran_lembur)
                                )}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                align="left"
                              >
                                {formatRupiah(item.gaji_bersih ?? "-")}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                className="capitalize"
                              >
                                {item.bank ?? "-"}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                className="capitalize"
                              >
                                {item.no_rekening ?? "-"}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: "12px", padding: "4px" }}
                                className="capitalize"
                              >
                                {item.an_rekening ?? "-"}
                              </TableCell>
                            </TableRow>
                          ))
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
                {selectedNamaList.length === 0 && (
                  <button
                    onClick={handleOpenModal}
                    className="bg-blue-600 text-white px-4 py-2 rounded-[20px] text-sm hover:bg-blue-700"
                  >
                    Lihat Ringkasan Gaji
                  </button>
                )}
              </div>

              {/* Jika ada pegawai terpilih, tampilkan ringkasan di bawah tombol */}
              {selectedNamaList.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-semibold">
                    Total Gaji Pokok Terpilih:{" "}
                    {formatRupiah(totalGajiPokokTerpilih)}
                  </div>
                  <div className="text-sm font-semibold">
                    Total Potongan Terpilih:{" "}
                    {formatRupiah(totalPotonganTerpilih)}
                  </div>
                  <div className="text-sm font-semibold">
                    Total Gaji Terpilih: {formatRupiah(totalGajiTerpilih)}
                  </div>
                  <div className="text-sm font-semibold">
                    Total Tunjangan Terpilih:{" "}
                    {formatRupiah(totalTunjanganTerpilih)}
                  </div>
                  <div className="text-sm font-semibold">
                    Total Lemburan Terpilih:{" "}
                    {formatRupiah(totalLemburanTerpilih)}
                  </div>
                  <div className="text-sm font-bold pb-1">
                    Total Gaji + Tunjangan + Lemburan Terpilih:{" "}
                    {formatRupiah(
                      totalGajiTerpilih +
                        totalLemburanTerpilih +
                        totalTunjanganTerpilih
                    )}
                  </div>
                </div>
              )}

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
                    <h3 className="text-xl font-bold mb-4 text-center">
                      Konfirmasi Pembayaran Gaji
                    </h3>

                    {/* Ringkasan Gaji */}
                    <div className="mb-4 space-y-3">
                      {gajiRingkasan.map((section, idx) => (
                        <div key={idx} className="border rounded-lg p-3">
                          <h4 className="font-semibold text-gray-700 mb-2">
                            {section.title}
                          </h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {section.data.map(([label, value], i) => (
                              <li
                                key={i}
                                className="flex justify-between border-b last:border-none pb-1"
                              >
                                <span>{label}</span>
                                <span className="font-medium">
                                  Rp {value.toLocaleString("id-ID")}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {/* List Pegawai */}
                    <div className="mb-4 max-h-40 overflow-y-auto border rounded p-2">
                      <h4 className="font-semibold mb-2 text-gray-700">
                        Pegawai yang dibayarkan:
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {selectedNamaList.map((nama, idx) => (
                          <li
                            key={idx}
                            className="bg-gray-100 rounded px-2 py-1"
                          >
                            {toTitleCase(nama)}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Pilihan Jenis Bayar */}
                    <div className="mb-4 grid grid-cols-2 gap-3">
                      {[
                        {
                          key: "gaji pokok",
                          label: "Gaji Pokok",
                          color: "bg-blue-500",
                        },
                        {
                          key: "pokok-tunjangan",
                          label: "Gaji + Tunjangan",
                          color: "bg-indigo-500",
                        },
                        {
                          key: "tunjangan",
                          label: "Tunjangan",
                          color: "bg-purple-500",
                        },
                        {
                          key: "lemburan",
                          label: "Lemburan",
                          color: "bg-teal-500",
                        },
                        {
                          key: "seluruh upah",
                          label: "Seluruh Upah",
                          color: "bg-green-500",
                        },
                      ].map((item) => (
                        <button
                          key={item.key}
                          onClick={() => setSelectedJenisBayar(item.key)}
                          className={`px-4 py-2 rounded-lg text-white font-semibold text-sm flex items-center justify-between gap-2 relative transition 
        ${item.color} 
        ${
          selectedJenisBayar === item.key
            ? "ring-2 ring-yellow-400 shadow-lg scale-105"
            : "hover:opacity-90"
        }`}
                        >
                          {item.label}
                          {selectedJenisBayar === item.key && (
                            <span className="absolute top-1 right-1 bg-white text-green-600 text-xs rounded-full px-1">
                              ✓
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Nominal sesuai pilihan */}
                    {selectedJenisBayar && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg text-center">
                        <p className="text-sm text-gray-600 mb-1">
                          Nominal yang akan dibayarkan:
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          Rp{" "}
                          {(() => {
                            switch (selectedJenisBayar) {
                              case "gaji pokok":
                                return totalGajiTerpilih.toLocaleString(
                                  "id-ID"
                                );
                              case "lemburan":
                                return totalLemburanTerpilih.toLocaleString(
                                  "id-ID"
                                );
                              case "pokok-tunjangan":
                                return (
                                  totalGajiTerpilih + totalTunjanganTerpilih
                                ).toLocaleString("id-ID");
                              case "tunjangan":
                                return totalTunjanganTerpilih.toLocaleString(
                                  "id-ID"
                                );
                              case "seluruh upah":
                                return (
                                  totalGajiTerpilih +
                                  totalTunjanganTerpilih +
                                  totalLemburanTerpilih
                                ).toLocaleString("id-ID");
                              default:
                                return 0;
                            }
                          })()}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        onClick={handleCloseBayarGajiModal}
                        className="px-4 py-2 bg-gray-400 text-white rounded-[20px]"
                      >
                        Batal
                      </button>
                      <button
                        onClick={async () => {
                          if (
                            !selectedJenisBayar ||
                            selectedNamaList.length === 0
                          )
                            return;

                          // 🔒 Validasi sebelum submit
                          const sudahAda = selectedPegawaiList.some((pegawai) =>
                            sudahDibayar(pegawai, selectedJenisBayar)
                          );
                          if (sudahAda) {
                            alert(
                              "❌ Beberapa pegawai sudah dibayarkan untuk jenis ini"
                            );
                            return;
                          }

                          const token = localStorage.getItem("token");
                          const endpointMap = {
                            "gaji pokok": "/pembayaran-gaji/gaji-pokok",
                            "pokok-tunjangan":
                              "/pembayaran-gaji/pokok-tunjangan",
                            tunjangan: "/pembayaran-gaji/tunjangan",
                            lemburan: "/pembayaran-gaji/lemburan",
                            "seluruh upah": "/pembayaran-gaji/",
                          };

                          setIsSubmitting(true); // mulai loading
                          try {
                            for (const pegawai of selectedPegawaiList) {
                              await api.post(
                                endpointMap[selectedJenisBayar],
                                {
                                  id_karyawan: pegawai.id_karyawan,
                                  bulan: selectedMonth,
                                  tahun: selectedYear,
                                  metode: "transfer",
                                },
                                {
                                  headers: {
                                    Authorization: `Bearer ${token}`,
                                    "Content-Type": "application/json",
                                    Accept: "application/json",
                                  },
                                }
                              );
                            }

                            alert("✅ Pembayaran gaji berhasil");
                            handleCloseBayarGajiModal();
                            await fetchPegawaiList();
                            await fetchStatusPembayaran();
                            fetchData();
                          } catch (err) {
                            console.error(
                              "Gagal bayar gaji:",
                              err.response?.data || err
                            );
                            alert("❌ Gagal melakukan pembayaran gaji");
                          } finally {
                            setIsSubmitting(false); // selesai loading
                          }
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-[20px] flex items-center justify-center gap-2"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                              ></path>
                            </svg>
                            Memproses...
                          </>
                        ) : (
                          "Konfirmasi"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {showModal && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black bg-opacity-50"
                  onClick={handleCloseModal}
                >
                  <div
                    className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h2 className="text-lg font-semibold mb-4">
                      Ringkasan Total Gaji
                    </h2>
                    <div className="space-y-4 text-sm">
                      {/* Gaji Pokok */}
                      <div>
                        <h3 className="font-semibold mb-1">Gaji Pokok</h3>
                        <div className="flex justify-between">
                          <span>Pegawai Tetap</span>
                          <span>{formatRupiah(totalGaji.pokok.tetap)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pegawai Tidak Tetap</span>
                          <span>
                            {formatRupiah(totalGaji.pokok.tidaktetap)}
                          </span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span>Total Semua</span>
                          <span>{formatRupiah(totalGaji.pokok.total)}</span>
                        </div>
                      </div>

                      {/* Potongan */}
                      <div>
                        <h3 className="font-semibold mb-1">Potongan</h3>
                        <div className="flex justify-between">
                          <span>Pegawai Tetap</span>
                          <span>{formatRupiah(totalGaji.potongan.tetap)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pegawai Tidak Tetap</span>
                          <span>
                            {formatRupiah(totalGaji.potongan.tidaktetap)}
                          </span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span>Total Semua</span>
                          <span>{formatRupiah(totalGaji.potongan.total)}</span>
                        </div>
                      </div>

                      {/* Gaji Bersih */}
                      <div>
                        <h3 className="font-semibold mb-1">Total Gaji</h3>
                        <div className="flex justify-between">
                          <span>Pegawai Tetap</span>
                          <span>{formatRupiah(totalGaji.bersih.tetap)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pegawai Tidak Tetap</span>
                          <span>
                            {formatRupiah(totalGaji.bersih.tidaktetap)}
                          </span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span>Total Semua</span>
                          <span>{formatRupiah(totalGaji.bersih.total)}</span>
                        </div>
                      </div>

                      {/* Tunjangan Kehadiran */}
                      <div>
                        <h3 className="font-semibold mb-1">
                          Tunjangan Kehadiran
                        </h3>
                        <div className="flex justify-between">
                          <span>Pegawai Tetap</span>
                          <span>{formatRupiah(totalGaji.tunjangan.tetap)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pegawai Tidak Tetap</span>
                          <span>
                            {formatRupiah(totalGaji.tunjangan.tidaktetap)}
                          </span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span>Total Semua</span>
                          <span>{formatRupiah(totalGaji.tunjangan.total)}</span>
                        </div>
                      </div>

                      {/* Gaji Lembur */}
                      <div>
                        <h3 className="font-semibold mb-1">Gaji Lembur</h3>
                        <div className="flex justify-between">
                          <span>Pegawai Tetap</span>
                          <span>{formatRupiah(totalGaji.lembur.tetap)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pegawai Tidak Tetap</span>
                          <span>
                            {formatRupiah(totalGaji.lembur.tidaktetap)}
                          </span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span>Total Semua</span>
                          <span>{formatRupiah(totalGaji.lembur.total)}</span>
                        </div>
                      </div>

                      {/* Total Keseluruhan */}
                      <div>
                        <h3 className="font-semibold mb-1">
                          Total Gaji Bersih (Gaji + Tunjangan + Lembur)
                        </h3>
                        <div className="flex justify-between">
                          <span>Pegawai Tetap</span>
                          <span>{formatRupiah(totalGaji.total.tetap)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pegawai Tidak Tetap</span>
                          <span>
                            {formatRupiah(totalGaji.total.tidaktetap)}
                          </span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-1">
                          <span>Total Semua</span>
                          <span>{formatRupiah(totalGaji.total.total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tombol Close dengan Icon */}
                    <button
                      onClick={handleCloseModal}
                      className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
                    >
                      <FiX />
                    </button>
                  </div>
                </div>
              )}

              {showBayarModal && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
                  onClick={handleCloseBayarModal} // klik backdrop → close modal
                >
                  <div
                    className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg"
                    onClick={(e) => e.stopPropagation()} // klik isi modal → tidak close
                  >
                    <h3 className="text-xl font-bold mb-4">Bayar Kasbon</h3>

                    {/* Dropdown Pegawai */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">
                        Nama Pegawai
                      </label>
                      <select
                        value={selectedPegawai}
                        onChange={(e) =>
                          handleSelectPegawai(Number(e.target.value))
                        }
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="">Pilih Pegawai</option>
                        {pegawaiList.map((pegawai) => (
                          <option
                            key={pegawai.id_karyawan}
                            value={pegawai.id_karyawan}
                          >
                            {pegawai.nama}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Kondisi */}
                    {!selectedPegawai && (
                      <div className="text-sm text-gray-500 italic">
                        Silakan pilih pegawai untuk melihat hutang.
                      </div>
                    )}

                    {selectedPegawai && hutangLoading && (
                      <div className="text-sm text-gray-500">
                        Memuat data hutang...
                      </div>
                    )}

                    {selectedPegawai &&
                      !hutangLoading &&
                      hutangData?.total_hutang === 0 && (
                        <div className="text-sm text-red-500 font-medium">
                          Pegawai ini tidak memiliki hutang.
                        </div>
                      )}

                    {selectedPegawai &&
                      !hutangLoading &&
                      hutangData?.total_hutang > 0 && (
                        <form
                          onSubmit={handleBayarHutang}
                          className="space-y-3 mt-3"
                        >
                          {/* Total Hutang */}
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Total Hutang
                            </label>
                            <input
                              type="text"
                              value={`Rp. ${hutangData.total_hutang.toLocaleString(
                                "id-ID"
                              )}`}
                              disabled
                              className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-100"
                            />
                          </div>

                          {/* Sisa Hutang */}
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Sisa Hutang
                            </label>
                            <input
                              type="text"
                              value={`Rp. ${hutangData.sisa_hutang.toLocaleString(
                                "id-ID"
                              )}`}
                              disabled
                              className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-100"
                            />
                          </div>

                          {/* Nominal */}
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Nominal Bayar
                            </label>
                            <input
                              type="number"
                              placeholder="Masukkan nominal pembayaran"
                              value={bayarData.nominal}
                              onChange={(e) =>
                                setBayarData({
                                  ...bayarData,
                                  nominal: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border rounded-lg text-sm"
                              required
                            />
                          </div>

                          {/* Metode */}
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Metode
                            </label>
                            <input
                              type="text"
                              value="Potong Gaji"
                              disabled
                              className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-100"
                            />
                          </div>

                          {/* Keterangan */}
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Keterangan
                            </label>
                            <input
                              type="text"
                              placeholder="Opsional"
                              value={bayarData.keterangan}
                              onChange={(e) =>
                                setBayarData({
                                  ...bayarData,
                                  keterangan: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border rounded-lg text-sm"
                            />
                          </div>

                          {/* Tombol */}
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
                      )}
                  </div>
                </div>
              )}

              {/* <div className="mt-2 ml-2 text-left space-y-0.5 text-sm font-semibold w-fit">
                <div className="flex">
                  <span className="w-56 text-xs">Total Gaji Pegawai Tetap</span>
                  <span className="mr-1">:</span>
                  <span className="font-bold text-xs">
                    {formatRupiah(totalGaji.tetap)}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-56 text-xs">
                    Total Gaji Pegawai Tidak Tetap
                  </span>
                  <span className="mr-1">:</span>
                  <span className="font-bold text-xs">
                    {formatRupiah(totalGaji.tidaktetap)}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-56 text-xs">Total Gaji Semua Pegawai</span>
                  <span className="mr-1">:</span>
                  <span className="font-bold text-xs">
                    {formatRupiah(totalGaji.total)}
                  </span>
                </div>
              </div> */}

              {/* Move buttons below pagination */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerhitunganGaji;
