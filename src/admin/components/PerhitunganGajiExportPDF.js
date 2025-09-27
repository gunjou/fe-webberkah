// src/utils/exportPDF.js
import { jsPDF } from "jspdf";
import "jspdf-autotable";

// Fungsi export PDF
export const PerhitunganGajiExportPDF = ({
  kolom,
  filteredData,
  selectedNamaList = [],
  getDateLabel,
  getFileName,
  getFilteredSections,
  toTitleCase,
  singkatTipe,
  formatTerlambat,
  formatRupiah,
}) => {
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

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(title, 9, 15);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(dateStr, 9, 22);

  const header = kolom.map((k) =>
    k.label
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );

  // Data body
  const dataUntukPDF =
    selectedNamaList.length > 0
      ? filteredData.filter((item) => selectedNamaList.includes(item.nama))
      : filteredData;

  const rows = dataUntukPDF.map((item) => [
    String(item.nip).padStart(3, "0"),
    toTitleCase(item.nama_panggilan),
    singkatTipe(item.tipe),
    item.jumlah_hadir ?? "-",
    item.jumlah_izin ?? "-",
    item.jumlah_sakit ?? "-",
    item.jumlah_alpha ?? "-",
    formatTerlambat(item.jam_terlambat + item.jam_kurang),
    formatRupiah(item.gaji_pokok),
    formatRupiah(item.tunjangan_kehadiran),
    "-" + formatRupiah(item.potongan),
    "-" + formatRupiah(item.kasbon),
    formatRupiah(item.gaji_bersih_tanpa_lembur),
    item.total_lembur ?? "-",
    formatTerlambat(item.total_menit_lembur) ?? "-",
    formatRupiah(item.total_bayaran_lembur),
    formatRupiah(item.gaji_bersih),
    item.bank ?? "-",
    item.no_rekening ?? "-",
    toTitleCase(item.an_rekening) ?? "-",
  ]);

  // Hitung total untuk setiap kolom yang perlu dijumlahkan
  const totals = {
    gaji_pokok: dataUntukPDF.reduce(
      (acc, item) => acc + (item.gaji_pokok || 0),
      0
    ),
    tunjangan_kehadiran: dataUntukPDF.reduce(
      (acc, item) => acc + (item.tunjangan_kehadiran || 0),
      0
    ),
    potongan: dataUntukPDF.reduce((acc, item) => acc + (item.potongan || 0), 0),
    kasbon: dataUntukPDF.reduce((acc, item) => acc + (item.kasbon || 0), 0),
    total_gaji: dataUntukPDF.reduce(
      (acc, item) => acc + (item.gaji_bersih_tanpa_lembur || 0),
      0
    ),
    total_bayaran_lembur: dataUntukPDF.reduce(
      (acc, item) => acc + (item.total_bayaran_lembur || 0),
      0
    ),
    gaji_bersih: dataUntukPDF.reduce(
      (acc, item) => acc + (item.gaji_bersih || 0),
      0
    ),
  };

  // AutoTable
  doc.autoTable({
    head: [header],
    body: rows,
    foot: [
      [
        {
          content: "TOTAL",
          colSpan: 8,
          styles: { halign: "center", fontStyle: "bold" },
        },
        formatRupiah(totals.gaji_pokok),
        formatRupiah(totals.tunjangan_kehadiran),
        formatRupiah(totals.potongan),
        formatRupiah(totals.kasbon),
        formatRupiah(totals.total_gaji),
        "", // kolom kosong
        "", // kolom kosong
        formatRupiah(totals.total_bayaran_lembur),
        formatRupiah(totals.gaji_bersih),
        "",
        "",
        "", // kolom kosong sisanya
      ],
    ],
    startY: 30,
    margin: { left: 9, right: 6 },
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
    footStyles: {
      fillColor: [245, 245, 245],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { halign: "left", cellWidth: 10 },
      1: { halign: "left", cellWidth: 12 },
      2: { halign: "center", cellWidth: 8 },
      3: { halign: "center", cellWidth: 8 },
      4: { halign: "center", cellWidth: 8 },
      5: { halign: "center", cellWidth: 8 },
      6: { halign: "center", cellWidth: 9 },
      7: { halign: "left", cellWidth: 12 },
      8: { halign: "left", cellWidth: 19 },
      9: { halign: "left", cellWidth: 18 },
      10: { halign: "left", cellWidth: 17 },
      11: { halign: "left", cellWidth: 17 },
      12: { halign: "left", cellWidth: 20 },
      13: { halign: "center", cellWidth: 8 },
      14: { halign: "left", cellWidth: 14 },
      15: { halign: "left", cellWidth: 19 },
      16: { halign: "left", cellWidth: 20 },
      17: { halign: "left", cellWidth: 10 },
      18: { halign: "left", cellWidth: 23 },
      19: { halign: "left", cellWidth: 25 },
    },
    didParseCell: (data) => {
      if (
        data.section === "body" &&
        (data.column.index === 4 || data.column.index === 5)
      ) {
        if (parseInt(data.cell.text[0], 10) > 0) {
          data.cell.styles.textColor = [0, 0, 255];
        }
      }
      if (data.section === "body" && data.column.index === 6) {
        if (parseInt(data.cell.text[0], 10) > 0) {
          data.cell.styles.textColor = [255, 0, 0];
        }
      }
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

  // Ringkasan total gaji
  let y = doc.lastAutoTable.finalY + 10;
  const estimatedRingkasanHeight = 3 * (3 * 5 + 6 + 3);
  const pageHeight = doc.internal.pageSize.getHeight();

  if (y + estimatedRingkasanHeight > pageHeight - 10) {
    doc.addPage();
    y = 15;
  }

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Ringkasan Total Gaji", 9, y);
  y += 8;

  const sections = getFilteredSections();

  sections.forEach((section) => {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(section.title, 9, y);
    y += 6;

    section.data.forEach(([label, value]) => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`${label}`, 20, y);

      doc.setFont("helvetica", "bold");
      doc.text(`${formatRupiah(value)}`, 100, y);
      y += 5;
    });

    y += 4;
  });

  doc.save(`${getFileName()}.pdf`);
};
