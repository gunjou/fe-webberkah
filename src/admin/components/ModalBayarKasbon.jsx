import React from "react";

export default function ModalBayarKasbon({
  showBayarModal,
  pegawaiList,
  selectedPegawai,
  handleSelectPegawai,
  hutangLoading,
  hutangData,
  handleBayarHutang,
  bayarData,
  setBayarData,
  setShowBayarModal,
  saving,
}) {
  if (!showBayarModal) return null; // jangan render kalau modal tidak aktif

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
            <label className="block text-sm font-medium mb-1">Metode</label>
            <input
              type="text"
              value="Potong Gaji"
              disabled
              className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-100"
            />
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
    </>
  );
}
