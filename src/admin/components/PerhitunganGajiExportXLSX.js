// src/utils/exportExcel.js
import * as XLSX from "xlsx";

export const PerhitunganGajiExportXLSX = ({
  filteredData,
  selectedNamaList = [],
  totalGajiTerpilih,
  totalLemburanTerpilih,
  getFileName,
  getFilteredSections,
  toTitleCase,
  singkatTipe,
  formatTerlambat,
  formatRupiah,
}) => {
  const confirmDownload = window.confirm(
    "Apakah Anda yakin ingin mengunduh data sebagai file Excel?"
  );
  if (!confirmDownload) return;

  const header = [
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

  // Filter data
  const dataUntukExcel =
    selectedNamaList.length > 0
      ? filteredData.filter((item) => selectedNamaList.includes(item.nama))
      : filteredData;

  const rows = dataUntukExcel.map((item) => [
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

  // Ringkasan
  let summaryRows = [];
  if (selectedNamaList.length > 0) {
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

  // Gabung header, data, summary
  const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows, ...summaryRows]);

  worksheet["!cols"] = [
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
