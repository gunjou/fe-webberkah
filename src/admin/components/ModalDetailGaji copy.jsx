import React, { useEffect, useState } from "react";
import api from "../../shared/Api";
import { FiX, FiFileText } from "react-icons/fi";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ModalDetailGaji = ({
  idKaryawan,
  defaultBulan,
  defaultTahun,
  onClose,
  formatRupiah,
}) => {
  const [bulan, setBulan] = useState(defaultBulan);
  const [tahun, setTahun] = useState(defaultTahun);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const potonganHarian = data?.potongan?.harian?.detail || [];
  const potonganBulanan = data?.potongan?.bulanan;

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/payroll/preview", {
        params: { id_karyawan: idKaryawan, bulan, tahun },
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (idKaryawan) fetchData();
  }, [idKaryawan, bulan, tahun]);

  if (!idKaryawan) return null;

  const handleExportPDF = () => {
    if (!data) return;

    const doc = new jsPDF("p", "mm", "a4");

    const bulanText = new Date(tahun, bulan - 1).toLocaleString("id-ID", {
      month: "long",
      year: "numeric",
    });

    /* ================= HEADER ================= */
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text("SLIP GAJI KARYAWAN", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text(`Periode: ${bulanText}`, 105, 26, { align: "center" });

    /* ================= INFO ================= */
    doc.text("Nama Karyawan", 14, 38);
    doc.text(":", 48, 38);
    doc.text(data.nama_karyawan || "-", 52, 38);

    doc.text("Jenis Pegawai", 14, 44);
    doc.text(":", 48, 44);
    doc.text(data.jenis_pegawai || "-", 52, 44);

    /* ================= KOMPONEN GAJI ================= */
    doc.autoTable({
      startY: 52,
      tableWidth: 180,
      margin: { left: 14 },
      head: [["Komponen Gaji", "Nominal"]],
      body: [
        ["Gaji Pokok", formatRupiah(data.komponen_gaji.gaji_pokok)],
        [
          "Tunjangan Jabatan",
          formatRupiah(data.komponen_gaji.tunjangan_jabatan),
        ],
        ["Tunjangan Makan", formatRupiah(data.komponen_gaji.tunjangan_makan)],
        [
          "Tunjangan Transport",
          formatRupiah(data.komponen_gaji.tunjangan_transport),
        ],
        ["Total Gaji Kotor", formatRupiah(data.komponen_gaji.total_gaji_kotor)],
      ],
      styles: {
        fontSize: 10,
        cellPadding: 4,
        textColor: 0,
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [229, 231, 235],
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 60, halign: "right" },
      },
      didParseCell: (d) => {
        if (d.row.index === 4) {
          d.cell.styles.fontStyle = "bold";
          d.cell.styles.fillColor = [229, 231, 235];
        }
      },
    });

    /* ================= POTONGAN HARIAN ================= */
    let startY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Potongan Harian", 14, startY);
    startY += 4;

    const potonganHarianRows = [];

    data.potongan?.harian?.detail?.forEach((d) => {
      d.potongan.forEach((p) => {
        potonganHarianRows.push([
          d.tanggal,
          p.jenis,
          p.target,
          `${p.persen}%`,
          `- ${formatRupiah(p.nominal)}`,
        ]);
      });
    });

    if (potonganHarianRows.length === 0) {
      potonganHarianRows.push(["-", "-", "-", "-", "-"]);
    }

    potonganHarianRows.push([
      "",
      "",
      "Total Potongan Harian",
      "",
      `- ${formatRupiah(data.potongan.harian.total)}`,
    ]);

    doc.autoTable({
      startY,
      tableWidth: 180,
      margin: { left: 14 },
      head: [["Tanggal", "Jenis", "Keterangan", "%", "Nominal"]],
      body: potonganHarianRows,
      styles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: 0,
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [229, 231, 235],
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 28 }, // tanggal
        1: { cellWidth: 32 }, // jenis
        2: { cellWidth: 60 }, // keterangan (LEBAR)
        3: { cellWidth: 20, halign: "right" },
        4: { cellWidth: 40, halign: "right" },
      },
      didParseCell: (d) => {
        if (d.row.raw?.[2] === "Total Potongan Harian") {
          d.cell.styles.fontStyle = "bold";
          d.cell.styles.fillColor = [229, 231, 235];
        }
      },
    });

    /* ================= POTONGAN BULANAN ================= */
    startY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Potongan Bulanan", 14, startY);
    startY += 4;

    const potonganBulananRows = [];

    if (data.potongan?.bulanan) {
      potonganBulananRows.push([
        data.potongan.bulanan.jenis,
        data.potongan.bulanan.target,
        `${data.potongan.bulanan.persen}%`,
        `${data.potongan.bulanan.jumlah} hari`,
        `- ${formatRupiah(data.potongan.bulanan.nominal)}`,
      ]);
    } else {
      potonganBulananRows.push(["-", "-", "-", "-", "-"]);
    }

    doc.autoTable({
      startY,
      tableWidth: 180,
      margin: { left: 14 },
      head: [["Jenis", "Keterangan", "%", "Jumlah", "Nominal"]],
      body: potonganBulananRows,
      styles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: 0,
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [229, 231, 235],
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 32 },
        1: { cellWidth: 60 }, // keterangan lebar
        2: { cellWidth: 20, halign: "right" },
        3: { cellWidth: 28, halign: "right" },
        4: { cellWidth: 40, halign: "right" },
      },
    });

    /* ================= TOTAL POTONGAN ================= */
    startY = doc.lastAutoTable.finalY + 8;

    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.text(
      `Total Potongan: - ${formatRupiah(data.potongan.total_potongan)}`,
      196,
      startY,
      { align: "right" }
    );

    /* ================= GAJI BERSIH ================= */
    startY += 10;

    doc.setFontSize(13);
    doc.setFont(undefined, "bold");
    doc.text("GAJI BERSIH", 14, startY);
    doc.text(formatRupiah(data.gaji_bersih), 196, startY, { align: "right" });

    /* ================= FOOTER ================= */
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.text("Slip gaji ini dihasilkan secara otomatis oleh sistem", 105, 285, {
      align: "center",
    });

    doc.save(
      `Slip_Gaji_${data.nama_karyawan}_${bulanText.replace(" ", "_")}.pdf`
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col">
      {/* ================= HEADER ================= */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            Detail Gaji Bulanan
          </h1>
          <p className="text-sm text-gray-500">
            {data?.nama_karyawan} •{" "}
            <span className="capitalize">{data?.jenis_pegawai}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* FILTER */}
          <select
            value={bulan}
            onChange={(e) => setBulan(Number(e.target.value))}
            className="border rounded-lg px-3 py-1.5 text-sm bg-white"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("id-ID", { month: "long" })}
              </option>
            ))}
          </select>

          <select
            value={tahun}
            onChange={(e) => setTahun(Number(e.target.value))}
            className="border rounded-lg px-3 py-1.5 text-sm bg-white"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const y = new Date().getFullYear() - i;
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              );
            })}
          </select>

          {/* EXPORT PDF */}
          <button
            onClick={handleExportPDF}
            className="ml-2 flex items-center gap-1 px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
          >
            <FiFileText size={16} />
            Export PDF
          </button>

          {/* CLOSE */}
          <button
            onClick={onClose}
            className="ml-2 p-2 rounded-full border hover:bg-red-100 text-red-500"
            title="Tutup"
          >
            <FiX size={20} />
          </button>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="flex-1 overflow-auto p-6 space-y-8">
        {loading ? (
          <div className="text-center text-gray-500">Memuat data payroll…</div>
        ) : !data ? (
          <div className="text-center text-red-500">Data tidak tersedia</div>
        ) : (
          <>
            {/* ================= KOMPONEN GAJI ================= */}
            <section>
              <h2 className="font-semibold text-gray-700 mb-3">
                Komponen Gaji
              </h2>
              <div className="overflow-hidden rounded-xl border bg-white">
                <table className="w-full text-sm">
                  <tbody>
                    <Row
                      label="Gaji Pokok"
                      value={data.komponen_gaji.gaji_pokok}
                    />
                    <Row
                      label="Tunjangan Jabatan"
                      value={data.komponen_gaji.tunjangan_jabatan}
                    />
                    <Row
                      label="Tunjangan Makan"
                      value={data.komponen_gaji.tunjangan_makan}
                    />
                    <Row
                      label="Tunjangan Transport"
                      value={data.komponen_gaji.tunjangan_transport}
                    />
                    <tr className="font-semibold bg-gray-100">
                      <td className="px-4 py-3">Total Gaji Kotor</td>
                      <td className="px-4 py-3 text-right">
                        {formatRupiah(data.komponen_gaji.total_gaji_kotor)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* ================= POTONGAN HARIAN ================= */}
            <section>
              <h3 className="font-semibold text-gray-700 mb-2">
                Potongan Harian
              </h3>

              <div className="overflow-hidden rounded-xl border bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 text-gray-600">
                    <tr>
                      <th className="px-4 py-3 text-left">Tanggal</th>
                      <th className="px-4 py-3 text-left">Jenis</th>
                      <th className="px-4 py-3 text-left">Keterangan</th>
                      <th className="px-4 py-3 text-right">%</th>
                      <th className="px-4 py-3 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {potonganHarian.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-3 text-center text-gray-500"
                        >
                          Tidak ada potongan harian
                        </td>
                      </tr>
                    )}

                    {potonganHarian.map((d, i) =>
                      d.potongan.map((p, idx) => (
                        <tr
                          key={`${i}-${idx}`}
                          className="odd:bg-white even:bg-gray-50"
                        >
                          <td className="px-4 py-2">{d.tanggal}</td>
                          <td className="px-4 py-2 capitalize">{p.jenis}</td>
                          <td className="px-4 py-2">{p.target}</td>
                          <td className="px-4 py-2 text-right">{p.persen}%</td>
                          <td className="px-4 py-2 text-right text-red-600">
                            -{formatRupiah(p.nominal)}
                          </td>
                        </tr>
                      ))
                    )}

                    <tr className="font-semibold bg-gray-100">
                      <td colSpan={4} className="px-4 py-3">
                        Total Potongan Harian
                      </td>
                      <td className="px-4 py-3 text-right text-red-700">
                        -{formatRupiah(data.potongan.harian.total)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
            {/* ================= POTONGAN BULANAN ================= */}
            <section>
              <h3 className="font-semibold text-gray-700 mb-2">
                Potongan Bulanan
              </h3>

              <div className="overflow-hidden rounded-xl border bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 text-gray-600">
                    <tr>
                      <th className="px-4 py-3 text-left">Jenis</th>
                      <th className="px-4 py-3 text-left">Keterangan</th>
                      <th className="px-4 py-3 text-right">%</th>
                      <th className="px-4 py-3 text-right">Jumlah</th>
                      <th className="px-4 py-3 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!potonganBulanan ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-3 text-center text-gray-500"
                        >
                          Tidak ada potongan bulanan
                        </td>
                      </tr>
                    ) : (
                      <tr className="bg-red-50">
                        <td className="px-4 py-2 capitalize">
                          {potonganBulanan.jenis}
                        </td>
                        <td className="px-4 py-2">{potonganBulanan.target}</td>
                        <td className="px-4 py-2 text-right">
                          {potonganBulanan.persen}%
                        </td>
                        <td className="px-4 py-2 text-right">
                          {potonganBulanan.jumlah} hari
                        </td>
                        <td className="px-4 py-2 text-right text-red-700">
                          -{formatRupiah(potonganBulanan.nominal)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <div className="rounded-xl border bg-gray-50 px-6 py-4 flex justify-between items-center">
                <span className="font-semibold text-gray-700">
                  Total Potongan
                </span>
                <span className="font-bold text-red-700">
                  -{formatRupiah(data.potongan.total_potongan)}
                </span>
              </div>
            </section>

            {/* ================= GAJI BERSIH ================= */}
            <section>
              <div className="rounded-xl border bg-green-50 px-6 py-4 flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">
                  Gaji Bersih
                </span>
                <span className="text-2xl font-bold text-green-700">
                  {formatRupiah(data.gaji_bersih)}
                </span>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

const Row = ({ label, value }) => (
  <tr className="odd:bg-white even:bg-gray-50">
    <td className="px-4 py-2">{label}</td>
    <td className="px-4 py-2 text-right">
      {value !== undefined
        ? new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(value)
        : "-"}
    </td>
  </tr>
);

export default ModalDetailGaji;
