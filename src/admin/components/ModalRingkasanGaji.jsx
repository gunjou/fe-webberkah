import { FiX } from "react-icons/fi";

const ModalRingkasanGaji = ({ totalGaji, formatRupiah, handleCloseModal }) => {
  return (
    <>
      <h2 className="text-lg font-semibold mb-4">Ringkasan Total Gaji</h2>
      <div className="space-y-4 text-sm">
        {/* Gaji Pokok */}
        <div>
          <h3 className="font-semibold mb-1">Gaji Pokok</h3>
          <div className="flex justify-between">
            <span>Pegawai Tetap</span>
            <span>{formatRupiah(totalGaji.pokok.tetap)}</span>
          </div>
          <div className="flex justify-between">
            <span>Pegawai Tidak Tetap</span>
            <span>{formatRupiah(totalGaji.pokok.tidaktetap)}</span>
          </div>
          <div className="flex justify-between font-medium border-t pt-1">
            <span>Total Semua</span>
            <span>{formatRupiah(totalGaji.pokok.total)}</span>
          </div>
        </div>

        {/* Potongan */}
        <div>
          <h3 className="font-semibold mb-1">Potongan</h3>
          <div className="flex justify-between">
            <span>Pegawai Tetap</span>
            <span>{formatRupiah(totalGaji.potongan.tetap)}</span>
          </div>
          <div className="flex justify-between">
            <span>Pegawai Tidak Tetap</span>
            <span>{formatRupiah(totalGaji.potongan.tidaktetap)}</span>
          </div>
          <div className="flex justify-between font-medium border-t pt-1">
            <span>Total Semua</span>
            <span>{formatRupiah(totalGaji.potongan.total)}</span>
          </div>
        </div>

        {/* Gaji Bersih */}
        <div>
          <h3 className="font-semibold mb-1">Total Gaji</h3>
          <div className="flex justify-between">
            <span>Pegawai Tetap</span>
            <span>{formatRupiah(totalGaji.bersih.tetap)}</span>
          </div>
          <div className="flex justify-between">
            <span>Pegawai Tidak Tetap</span>
            <span>{formatRupiah(totalGaji.bersih.tidaktetap)}</span>
          </div>
          <div className="flex justify-between font-medium border-t pt-1">
            <span>Total Semua</span>
            <span>{formatRupiah(totalGaji.bersih.total)}</span>
          </div>
        </div>

        {/* Tunjangan Kehadiran */}
        <div>
          <h3 className="font-semibold mb-1">Tunjangan Kehadiran</h3>
          <div className="flex justify-between">
            <span>Pegawai Tetap</span>
            <span>{formatRupiah(totalGaji.tunjangan.tetap)}</span>
          </div>
          <div className="flex justify-between">
            <span>Pegawai Tidak Tetap</span>
            <span>{formatRupiah(totalGaji.tunjangan.tidaktetap)}</span>
          </div>
          <div className="flex justify-between font-medium border-t pt-1">
            <span>Total Semua</span>
            <span>{formatRupiah(totalGaji.tunjangan.total)}</span>
          </div>
        </div>

        {/* Gaji Lembur */}
        <div>
          <h3 className="font-semibold mb-1">Gaji Lembur</h3>
          <div className="flex justify-between">
            <span>Pegawai Tetap</span>
            <span>{formatRupiah(totalGaji.lembur.tetap)}</span>
          </div>
          <div className="flex justify-between">
            <span>Pegawai Tidak Tetap</span>
            <span>{formatRupiah(totalGaji.lembur.tidaktetap)}</span>
          </div>
          <div className="flex justify-between font-medium border-t pt-1">
            <span>Total Semua</span>
            <span>{formatRupiah(totalGaji.lembur.total)}</span>
          </div>
        </div>

        {/* Total Keseluruhan */}
        <div>
          <h3 className="font-semibold mb-1">
            Total Gaji Bersih (Gaji + Tunjangan + Lembur)
          </h3>
          <div className="flex justify-between">
            <span>Pegawai Tetap</span>
            <span>{formatRupiah(totalGaji.total.tetap)}</span>
          </div>
          <div className="flex justify-between">
            <span>Pegawai Tidak Tetap</span>
            <span>{formatRupiah(totalGaji.total.tidaktetap)}</span>
          </div>
          <div className="flex justify-between font-bold border-t pt-1">
            <span>Total Semua</span>
            <span>{formatRupiah(totalGaji.total.total)}</span>
          </div>
        </div>
      </div>

      {/* Tombol Close */}
      <button
        onClick={handleCloseModal}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
      >
        <FiX />
      </button>
    </>
  );
};

export default ModalRingkasanGaji;
