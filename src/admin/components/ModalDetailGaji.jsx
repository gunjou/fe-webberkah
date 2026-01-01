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

    // ================= HEADER =================
    doc.setFontSize(16);
    doc.text("SLIP GAJI KARYAWAN", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.text(`Periode: ${bulanText}`, 105, 26, { align: "center" });

    // ================= INFO KARYAWAN =================
    doc.setFontSize(10);
    doc.text("Nama Karyawan", 14, 38);
    doc.text(":", 50, 38);
    doc.text(
      data.nama_karyawan
        ?.toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      55,
      38
    );

    doc.text(
      data.jenis_pegawai
        ?.toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      55,
      44
    );
    doc.text(":", 50, 44);
    doc.text(data.jenis_pegawai, 55, 44);

    // ================= KOMPONEN GAJI =================
    doc.autoTable({
      startY: 52,
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
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [229, 240, 255], // biru soft
        textColor: 40,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      columnStyles: {
        1: { halign: "right" },
      },
      didParseCell: (dataCell) => {
        if (dataCell.row.index === 4) {
          dataCell.cell.styles.fillColor = [229, 231, 235]; // total
          dataCell.cell.styles.fontStyle = "bold";
        }
      },
    });

    // ================= POTONGAN =================
    const potonganRows = [];

    data.potongan?.harian?.detail.forEach((d) => {
      d.potongan.forEach((p) => {
        potonganRows.push([
          d.tanggal,
          `${p.jenis} (${p.target})`,
          `${p.persen}%`,
          `- ${formatRupiah(p.nominal)}`,
        ]);
      });
    });

    if (data.potongan?.bulanan) {
      potonganRows.push([
        "Bulanan",
        `${data.potongan.bulanan.jenis} (${data.potongan.bulanan.target})`,
        `${data.potongan.bulanan.persen}%`,
        `- ${formatRupiah(data.potongan.bulanan.nominal)}`,
      ]);
    }

    potonganRows.push([
      "",
      "Total Potongan",
      "",
      `- ${formatRupiah(data.potongan.total_potongan)}`,
    ]);

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 8,
      head: [["Tanggal", "Keterangan", "Persen", "Nominal"]],
      body: potonganRows,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [255, 241, 242], // pink soft
        textColor: 80,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      columnStyles: {
        2: { halign: "right" },
        3: { halign: "right", textColor: [180, 0, 0] },
      },
      didParseCell: (dataCell) => {
        if (dataCell.row.raw && dataCell.row.raw[1] === "Total Potongan") {
          dataCell.cell.styles.fillColor = [229, 231, 235];
          dataCell.cell.styles.fontStyle = "bold";
          dataCell.cell.styles.textColor = [180, 0, 0];
        }
      },
    });

    // ================= GAJI BERSIH =================
    const finalY = doc.lastAutoTable.finalY + 12;

    doc.setFillColor(220, 252, 231); // green soft
    doc.rect(14, finalY - 6, 182, 10, "F");

    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("GAJI BERSIH", 18, finalY);
    doc.text(formatRupiah(data.gaji_bersih), 196, finalY, {
      align: "right",
    });

    // ================= FOOTER =================
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

            {/* ================= POTONGAN ================= */}
            <section>
              <h2 className="font-semibold text-red-600 mb-3">Potongan</h2>
              <div className="overflow-hidden rounded-xl border bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 text-gray-600 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left">Tanggal</th>
                      <th className="px-4 py-3 text-left">Jenis</th>
                      <th className="px-4 py-3 text-left">Target</th>
                      <th className="px-4 py-3 text-right">%</th>
                      <th className="px-4 py-3 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.potongan.harian.detail.map((d, i) =>
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

                    {data.potongan.bulanan && (
                      <tr className="bg-red-50">
                        <td className="px-4 py-2">Bulanan</td>
                        <td className="px-4 py-2 capitalize">
                          {data.potongan.bulanan.jenis}
                        </td>
                        <td className="px-4 py-2">
                          {data.potongan.bulanan.target}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {data.potongan.bulanan.persen}%
                        </td>
                        <td className="px-4 py-2 text-right text-red-700">
                          -{formatRupiah(data.potongan.bulanan.nominal)}
                        </td>
                      </tr>
                    )}

                    <tr className="font-semibold bg-gray-100">
                      <td colSpan={4} className="px-4 py-3">
                        Total Potongan
                      </td>
                      <td className="px-4 py-3 text-right text-red-700">
                        -{formatRupiah(data.potongan.total_potongan)}
                      </td>
                    </tr>
                  </tbody>
                </table>
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
