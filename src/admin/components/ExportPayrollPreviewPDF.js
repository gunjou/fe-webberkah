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

  const confirmExport = window.confirm("Unduh data gaji ke PDF?");
  if (!confirmExport) return;

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
      "Gaji Lembur",
      "Total",
      "Keterangan",
    ],
  ];

  const tableBody = rowsData.map((item, index) => {
    const lembur = item.total_bayaran_lembur || 0;
    const gajiBersih = item.gaji_bersih || 0;
    const total = gajiBersih + lembur;

    return [
      index + 1,
      capitalize(item.nama),
      capitalize(item.jenis_pegawai),
      formatRupiah(item.gaji_kotor || 0),
      formatRupiah(item.total_potongan || 0),
      formatRupiah(gajiBersih),
      formatRupiah(lembur),
      formatRupiah(total),
      safeString(item.keterangan),
    ];
  });

  /* ========================
     AUTOTABLE
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
      1: { cellWidth: 40 },
      2: { halign: "center", cellWidth: 28 },
      3: { halign: "right", cellWidth: 32 },
      4: { halign: "right", cellWidth: 32 },
      5: { halign: "right", cellWidth: 32 },
      6: { halign: "right", cellWidth: 30 }, // lembur
      7: { halign: "right", cellWidth: 32 }, // total
      8: { cellWidth: 55 },
    },

    didParseCell: (data) => {
      // Potongan merah
      if (data.section === "body" && data.column.index === 4) {
        data.cell.styles.textColor = [198, 40, 40];
      }

      // Gaji Bersih bold
      if (data.section === "body" && data.column.index === 5) {
        data.cell.styles.fontStyle = "bold";
      }

      // Lembur biru
      if (data.section === "body" && data.column.index === 6) {
        data.cell.styles.textColor = [25, 118, 210];
      }

      // Total hijau & bold
      if (data.section === "body" && data.column.index === 7) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.textColor = [46, 125, 50];
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

  const totalGajiLembur = rowsData.reduce(
    (sum, d) => sum + (d.total_bayaran_lembur || 0),
    0
  );

  const totalGajiBersihPlusLembur = totalGajiBersih + totalGajiLembur;

  /* ========================
     TOTAL SECTION
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
  drawTotalRow("Total Gaji Bersih", totalGajiBersih);
  drawTotalRow("Total Gaji Lembur", totalGajiLembur);
  drawTotalRow("TOTAL DITERIMA", totalGajiBersihPlusLembur, true);

  /* ========================
     SAVE FILE
  ======================== */
  const buildSelectedName = (names = []) => {
    if (!names.length) return "Karyawan";

    const firstNames = names.map(getFirstName);

    if (firstNames.length > 5) {
      return `${firstNames[0]}_dkk`;
    }

    if (firstNames.length === 1) {
      return firstNames[0];
    }

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
