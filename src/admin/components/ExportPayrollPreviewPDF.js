import { jsPDF } from "jspdf";
import "jspdf-autotable";

/* ========================
   SAFE HELPERS
======================== */
const safeString = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
};

const sanitizeFileName = (text = "") =>
  text
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_");

const getFirstName = (fullName = "") => {
  if (!fullName) return "";
  return fullName.trim().split(" ")[0];
};

const buildFileName = ({ selectedNamaList, rowsData, monthName, tahun }) => {
  if (selectedNamaList.length === 1) {
    const firstName = getFirstName(selectedNamaList[0]);
    return `Gaji_${sanitizeFileName(firstName)}_${monthName}_${tahun}`;
  }

  if (selectedNamaList.length > 1 && selectedNamaList.length <= 3) {
    const firstName = getFirstName(selectedNamaList[0]);
    return `Gaji_${sanitizeFileName(firstName)}_dkk_${monthName}_${tahun}`;
  }

  return `Gaji_${rowsData.length}_Pegawai_${monthName}_${tahun}`;
};

const capitalize = (value) => {
  const str = safeString(value);
  if (str === "-") return "-";

  return str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

/* ========================
   EXPORT FUNCTION
======================== */
export const ExportPayrollPreviewPDF = ({
  data = [],
  selectedNamaList = [],
  bulan,
  tahun,
  formatRupiah,
}) => {
  if (!data.length) {
    alert("Tidak ada data untuk diexport");
    return;
  }

  const confirm = window.confirm("Unduh data gaji ke PDF?");
  if (!confirm) return;

  /* ========================
     FILTER DATA
  ======================== */
  const rowsData =
    selectedNamaList.length > 0
      ? data.filter((d) => selectedNamaList.includes(d.nama))
      : data;

  /* ========================
     INIT PDF
  ======================== */
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const monthName = new Date(tahun, bulan - 1).toLocaleString("id-ID", {
    month: "long",
  });

  /* ========================
     HEADER
  ======================== */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Rekapitulasi Gaji Karyawan", 14, 14);

  doc.setFontSize(11);
  doc.text("PT. Berkah Angsana Teknika", 14, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Periode: ${monthName} ${tahun}`, 14, 26);

  /* ========================
     TABLE DATA
  ======================== */
  const tableHead = [
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

  const tableBody = rowsData.map((item, index) => [
    index + 1,
    capitalize(item.nama),
    capitalize(item.jenis_pegawai),
    formatRupiah(item.gaji_kotor || 0),
    formatRupiah(item.total_potongan || 0),
    formatRupiah(item.gaji_bersih || 0),
    safeString(item.keterangan),
  ]);

  /* ========================
     AUTOTABLE (NO TOTAL)
  ======================== */
  doc.autoTable({
    startY: 32,
    head: tableHead,
    body: tableBody,

    styles: {
      fontSize: 9,
      cellPadding: 3,
      valign: "middle",
    },

    headStyles: {
      fillColor: [64, 64, 64], // abu tua
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },

    bodyStyles: {
      fillColor: [255, 255, 255],
      textColor: [40, 40, 40],
    },

    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },

    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { cellWidth: 45 },
      2: { halign: "center", cellWidth: 30 },
      3: { halign: "right", cellWidth: 35 },
      4: { halign: "right", cellWidth: 35 },
      5: { halign: "right", cellWidth: 35 },
      6: { cellWidth: 70 },
    },

    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 4) {
        data.cell.styles.textColor = [198, 40, 40]; // potongan merah
      }

      if (data.section === "body" && data.column.index === 5) {
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  /* ========================
     HITUNG TOTAL
  ======================== */
  const totalGajiKotor = rowsData.reduce(
    (sum, d) => sum + (d.gaji_kotor || 0),
    0
  );
  const totalPotongan = rowsData.reduce(
    (sum, d) => sum + (d.total_potongan || 0),
    0
  );
  const totalGajiBersih = rowsData.reduce(
    (sum, d) => sum + (d.gaji_bersih || 0),
    0
  );

  /* ========================
     TOTAL SECTION (SEPARATE)
  ======================== */
  let y = doc.lastAutoTable.finalY + 12;

  if (y > doc.internal.pageSize.getHeight() - 30) {
    doc.addPage();
    y = 20;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Ringkasan Total Gaji", 14, y);

  y += 8;

  const totalBoxX = 14;
  const labelX = totalBoxX + 2;
  const valueX = totalBoxX + 90;

  doc.setFontSize(10);

  const drawTotalRow = (label, value, isBold = false) => {
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.text(label, labelX, y);
    doc.text(formatRupiah(value), valueX, y, { align: "right" });
    y += 6;
  };

  drawTotalRow("Total Gaji Kotor", totalGajiKotor);
  drawTotalRow("Total Potongan", totalPotongan);
  drawTotalRow("Total Gaji Bersih", totalGajiBersih, true);

  /* ========================
     SAVE FILE
  ======================== */
  const getFirstName = (name = "") =>
    name?.trim()?.split(" ")?.[0] || "Karyawan";

  const buildSelectedName = (names = []) => {
    if (!names.length) return "Karyawan";

    const firstNames = names.map(getFirstName);

    // Lebih dari 5 → NamaPertama_dkk
    if (firstNames.length > 5) {
      return `${firstNames[0]}_dkk`;
    }

    // 1 orang
    if (firstNames.length === 1) {
      return firstNames[0];
    }

    // 2–5 orang → gabung & terakhir pakai &
    if (firstNames.length >= 2 && firstNames.length <= 5) {
      return (
        firstNames.slice(0, -1).join("_") +
        "_&_" +
        firstNames[firstNames.length - 1]
      );
    }

    return "Karyawan";
  };

  const selectedNameLabel =
    selectedNamaList.length > 0
      ? buildSelectedName(selectedNamaList)
      : "Karyawan";

  const fileName = `Gaji_${selectedNameLabel}_${monthName}_${tahun}`;

  doc.save(`${fileName}.pdf`);
};
