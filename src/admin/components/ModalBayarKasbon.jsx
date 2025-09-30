import React, { useState, useEffect } from "react";
import api from "../../shared/Api";

const ModalBayarKasbon = ({ setShowBayarKasbon }) => {
  const [selectedBulan, setSelectedBulan] = useState(null);
  const [pegawaiList, setPegawaiList] = useState([]);
  const [selectedPegawai, setSelectedPegawai] = useState("");
  const [hutangData, setHutangData] = useState(null);
  const [hutangLoading, setHutangLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bayarData, setBayarData] = useState({
    nominal: "",
    keterangan: "",
  });

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

  // Saat pegawai dipilih ambil data hutangnya
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
      formData.append("bulan", selectedBulan || "");
      formData.append("keterangan", bayarData.keterangan || "");

      await api.post("/hutang/pembayaran", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      alert("Pembayaran hutang berhasil");

      setBayarData({ nominal: "", keterangan: "" });
      setSelectedPegawai("");
      setHutangData(null);
    } catch (err) {
      console.error("Error bayar hutang:", err.response?.data || err);
      alert("Gagal melakukan pembayaran hutang");
    }

    setSaving(false);
  };

  return (
    <>
      <h3 className="text-xl font-bold mb-4">Bayar Kasbon</h3>
      {/* Dropdown Pegawai */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Nama Pegawai</label>
        <select
          value={selectedPegawai}
          onChange={(e) => handleSelectPegawai(Number(e.target.value))}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        >
          <option value="">Pilih Pegawai</option>
          {pegawaiList.map((pegawai) => (
            <option key={pegawai.id_karyawan} value={pegawai.id_karyawan}>
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
        <div className="text-sm text-gray-500">Memuat data hutang...</div>
      )}

      {selectedPegawai && !hutangLoading && hutangData?.total_hutang === 0 && (
        <div className="text-sm text-red-500 font-medium">
          Pegawai ini tidak memiliki hutang.
        </div>
      )}

      {selectedPegawai && !hutangLoading && hutangData?.total_hutang > 0 && (
        <form onSubmit={handleBayarHutang} className="space-y-3 mt-3">
          {/* Total Hutang */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Total Hutang
            </label>
            <input
              type="text"
              value={`Rp. ${hutangData.total_hutang.toLocaleString("id-ID")}`}
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
              value={`Rp. ${hutangData.sisa_hutang.toLocaleString("id-ID")}`}
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
              type="text"
              placeholder="Masukkan nominal pembayaran"
              value={
                bayarData.nominal
                  ? `Rp. ${Number(bayarData.nominal).toLocaleString("id-ID")}`
                  : ""
              }
              onChange={(e) => {
                // Hanya ambil angka saja
                const rawValue = e.target.value.replace(/[^0-9]/g, "");
                setBayarData({
                  ...bayarData,
                  nominal: rawValue ? Number(rawValue) : "",
                });
              }}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              required
            />
          </div>

          {/* Metode */}
          <div>
            <label className="block text-sm font-medium mb-1">Metode</label>
            <div className="flex gap-2">
              {/* input readonly */}
              <input
                type="text"
                value="Potong Gaji"
                disabled
                className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-100"
              />

              {/* dropdown bulan */}
              <select
                required
                className="px-3 py-2 border rounded-lg text-sm"
                value={selectedBulan}
                onChange={(e) => setSelectedBulan(e.target.value)}
              >
                <option value="">Pilih Bulan</option>
                {[
                  "Januari",
                  "Februari",
                  "Maret",
                  "April",
                  "Mei",
                  "Juni",
                  "Juli",
                  "Agustus",
                  "September",
                  "Oktober",
                  "November",
                  "Desember",
                ].map((bulan, i) => (
                  <option key={i} value={bulan}>
                    {bulan}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-sm font-medium mb-1">Keterangan</label>
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
              onClick={() => setShowBayarKasbon(false)}
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
    </>
  );
};

export default ModalBayarKasbon;
