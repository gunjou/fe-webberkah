import React from "react";
import { useNavigate } from "react-router-dom";

const Announcement = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[100dvh] bg-gradient-to-b from-custom-merah to-custom-gelap p-4">
      <div className="bg-white rounded-[28px] shadow-2xl p-6 sm:p-8 max-w-[340px] w-full relative overflow-visible">
        {/* Logo Section - Floating effect untuk menghemat ruang vertikal */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2">
          <div className="bg-white p-2 rounded-full shadow-lg border-2 border-red-50">
            <img
              src={process.env.PUBLIC_URL + "/images/logo_large.png"}
              className="w-16 h-16 rounded-full object-contain"
              alt="berkahangsana-logo"
            />
          </div>
        </div>

        <div className="mt-8 text-center">
          <h3 className="text-[11px] font-bold tracking-[0.2em] text-red-600 uppercase mb-1">
            PENTING & WAJIB DIPATUHI
          </h3>
          <h2 className="text-2xl font-black text-gray-900 leading-tight tracking-tight">
            JAUHI BARANG <br />{" "}
            <span className="text-[#b22222]">TERLARANG</span>
          </h2>

          {/* Banner Himbauan Kontras Tinggi */}
          <div className="mt-3 mb-4 p-3 bg-[#b22222] rounded-xl shadow-inner">
            <p className="text-[12px] font-bold text-white uppercase leading-tight">
              Pekerja Dilarang Keras Mengedarkan, Membantu, atau Menggunakan:
            </p>
          </div>

          {/* List Item dengan Kontras Box */}
          <div className="space-y-2 mx-auto w-full text-left">
            {[
              "Narkoba",
              "Ganja",
              "Minuman Beralkohol",
              "Obat-obatan Terlarang",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center bg-gray-50 border-l-4 border-[#b22222] p-2 rounded-r-lg shadow-sm"
              >
                <span className="mr-3 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <span className="text-[14px] font-extrabold text-gray-800">
                  {item}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-5 text-[11px] leading-relaxed text-gray-600 font-medium">
            Karyawan adalah cerminan keluarga & perusahaan.
            <span className="block font-bold text-gray-900 mt-1 uppercase">
              Patuhi aturan demi lingkungan kerja sehat!
            </span>
          </p>
        </div>

        {/* Action Button - Lebih Mencolok */}
        <div className="mt-6">
          <button
            onClick={() => navigate("/")}
            className="w-full rounded-2xl bg-gray-900 py-4 text-sm font-black text-white transition-all hover:bg-red-700 active:scale-95 shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
          >
            SAYA MENGERTI & AKAN PATUH
          </button>
        </div>
      </div>
    </div>
  );
};

export default Announcement;
