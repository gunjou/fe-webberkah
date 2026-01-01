import * as XLSX from "xlsx";

/* ========================
   HELPERS
======================== */
const getFirstName = (name = "") =>
  name?.toString()?.trim()?.split(" ")?.[0] || "Karyawan";

const buildSelectedName = (names = []) => {
  if (!names.length) return "Karyawan";

  const firstNames = names.map(getFirstName);

  // > 5 orang → Aluh_dkk
  if (firstNames.length > 5) {
    return `${firstNames[0]}_dkk`;
  }

  // 1 orang
  if (firstNames.length === 1) {
    return firstNames[0];
  }

  // 2–5 orang → aluh_budi_&_fulan
  return (
    firstNames.slice(0, -1).join("_") +
    "_&_" +
    firstNames[firstNames.length - 1]
  );
};

/* ========================
   EXPORT EXCEL
======================== */
export const exportPayrollExcel = ({
  data = [],
  selectedNamaList = [],
  bulan,
  tahun,
}) => {
  if (!data.length) {
    alert("Tidak ada data untuk diexport");
    return;
  }

  /* ========================
     FILTER DATA
  ======================== */
  const rowsData =
    selectedNamaList.length > 0
      ? data.filter((d) => selectedNamaList.includes(d.nama))
      : data;

  /* ========================
     PERIODE
  ======================== */
  const monthName = new Date(tahun, bulan - 1).toLocaleString("id-ID", {
    month: "long",
  });

  /* ========================
     HEADER TABEL
  ======================== */
  const sheetData = [
    [
      "No",
      "Nama",
      "Jenis Pegawai",
      "Gaji Kotor",
      "Total Potongan",
      "Gaji Bersih",
      "Keterangan",
    ],
  ];

  /* ========================
     ROW DATA
  ======================== */
  rowsData.forEach((item, index) => {
    sheetData.push([
      index + 1,
      item.nama || "-",
      item.jenis_pegawai || "-",
      Number(item.gaji_kotor || 0),
      Number(item.total_potongan_estimasi || 0),
      Number(item.gaji_bersih || 0),
      item.rekap_disiplin || "-",
    ]);
  });

  /* ========================
     TOTAL (TERPISAH)
  ======================== */
  const totalGajiKotor = rowsData.reduce(
    (sum, r) => sum + (r.gaji_kotor || 0),
    0
  );

  const totalPotongan = rowsData.reduce(
    (sum, r) => sum + (r.total_potongan_estimasi || 0),
    0
  );

  const totalGajiBersih = rowsData.reduce(
    (sum, r) => sum + (r.gaji_bersih || 0),
    0
  );

  // baris kosong
  sheetData.push([]);
  sheetData.push(["RINGKASAN TOTAL"]);
  sheetData.push(["Total Gaji Kotor", totalGajiKotor]);
  sheetData.push(["Total Potongan", totalPotongan]);
  sheetData.push(["Total Gaji Bersih", totalGajiBersih]);

  /* ========================
     CREATE WORKSHEET
  ======================== */
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  worksheet["!cols"] = [
    { wch: 5 },
    { wch: 24 },
    { wch: 18 },
    { wch: 16 },
    { wch: 18 },
    { wch: 16 },
    { wch: 32 },
  ];

  /* ========================
     WORKBOOK
  ======================== */
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll");

  /* ========================
     FILE NAME
  ======================== */
  const selectedNameLabel =
    selectedNamaList.length > 0
      ? buildSelectedName(selectedNamaList)
      : "Karyawan";

  const fileName = `Gaji_${selectedNameLabel}_${monthName}_${tahun}.xlsx`;

  /* ========================
     DOWNLOAD (NO file-saver)
  ======================== */
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
