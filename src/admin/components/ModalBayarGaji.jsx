import React, { useState, useEffect } from "react";

export default function ModalBayarGaji({
  setPegawaiList,
  gajiRingkasan,
  selectedNamaList,
  selectedJenisBayar,
  setSelectedJenisBayar,
  totalGajiTerpilih,
  totalLemburanTerpilih,
  totalTunjanganTerpilih,
  selectedPegawaiList,
  sudahDibayar,
  setStatusPembayaran,
  selectedMonth,
  selectedYear,
  api,
  handleCloseBayarGajiModal,
  fetchData,
  toTitleCase,
}) {
  // state untuk loading saat submit bayar gaji
  const [isSubmitting, setIsSubmitting] = useState(false);

  // hanya sekali saat mount
  useEffect(() => {
    fetchPegawaiList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // setiap kali bulan/tahun berubah
  useEffect(() => {
    fetchStatusPembayaran();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedYear]);

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

  return (
    <>
      {/* Judul */}
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
            <li key={idx} className="bg-gray-100 rounded px-2 py-1">
              {toTitleCase(nama)}
            </li>
          ))}
        </ul>
      </div>

      {/* Pilihan Jenis Bayar */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        {[
          { key: "gaji pokok", label: "Gaji Pokok", color: "bg-blue-500" },
          {
            key: "pokok-tunjangan",
            label: "Gaji + Tunjangan",
            color: "bg-indigo-500",
          },
          { key: "tunjangan", label: "Tunjangan", color: "bg-purple-500" },
          { key: "lemburan", label: "Lemburan", color: "bg-teal-500" },
          { key: "seluruh upah", label: "Seluruh Upah", color: "bg-green-500" },
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
                  return totalGajiTerpilih.toLocaleString("id-ID");
                case "lemburan":
                  return totalLemburanTerpilih.toLocaleString("id-ID");
                case "pokok-tunjangan":
                  return (
                    totalGajiTerpilih + totalTunjanganTerpilih
                  ).toLocaleString("id-ID");
                case "tunjangan":
                  return totalTunjanganTerpilih.toLocaleString("id-ID");
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
            if (!selectedJenisBayar || selectedNamaList.length === 0) return;

            // 🔒 Validasi sebelum submit
            const sudahAda = selectedPegawaiList.some((pegawai) =>
              sudahDibayar(pegawai, selectedJenisBayar)
            );
            if (sudahAda) {
              alert("❌ Beberapa pegawai sudah dibayarkan untuk jenis ini");
              return;
            }

            const token = localStorage.getItem("token");
            const endpointMap = {
              "gaji pokok": "/pembayaran-gaji/gaji-pokok",
              "pokok-tunjangan": "/pembayaran-gaji/pokok-tunjangan",
              tunjangan: "/pembayaran-gaji/tunjangan",
              lemburan: "/pembayaran-gaji/lemburan",
              "seluruh upah": "/pembayaran-gaji/",
            };

            setIsSubmitting(true);
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
              console.error("Gagal bayar gaji:", err.response?.data || err);
              alert("❌ Gagal melakukan pembayaran gaji");
            } finally {
              setIsSubmitting(false);
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
    </>
  );
}
