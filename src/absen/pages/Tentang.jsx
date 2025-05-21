import React from "react";
import api from "../../shared/Api";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { SiGmail } from "react-icons/si";
import { FaFacebook, FaTwitter, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { RiHomeLine } from "react-icons/ri";

const Tentang = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b text-white from-custom-merah to-custom-gelap min-h-[100dvh]">
      <div className="flex flex-col items-center relative">
        {" "}
        <div className="w-full px-4 pt-4 absolute top-0 left-0 flex justify-start space-x-3">
          <button
            title="Back"
            onClick={() => navigate(-1)}
            className="text-white text-2xl hover:text-gray-300"
          >
            <FiArrowLeft />
          </button>
          <button
            title="Home"
            onClick={() => navigate("/absensi")}
            className="text-white text-2xl hover:text-gray-300"
          >
            <RiHomeLine />
          </button>
        </div>
      </div>

      <div className="bg-white mx-10 my-14 px-2 py-2 rounded-lg">
        <h1 className="text-2xl px-9 text-left pb-4 pt-4 text-black font-bold">
          Tentang
        </h1>
        <p className="mt-2 text-black px-10 text-xs text-justify">
          PT. Berkah Angsana Teknik adalah perusahaan yang bergerak di bidang
          pelaksanaan jasa konstruksi dan merupakan anggota resmi dari asosiasi
          GAPENSI. Berlokasi di Dusun Perampuan Barat, Desa Perampuan, Kecamatan
          Labuapi, Kabupaten Lombok Barat, Indonesia, perusahaan ini dikenal
          memiliki reputasi baik dalam menyediakan layanan konstruksi
          berkualitas tinggi.
        </p>
        <p className="mt-4 text-black px-10 text-xs text-justify">
          Sebagai badan usaha berbentuk Perseroan Terbatas (PT), PT. Berkah
          Angsana Teknik berkomitmen untuk memberikan hasil terbaik dalam setiap
          proyek yang dijalankan. Perusahaan kami menjunjung tinggi
          profesionalisme dan kualitas kerja, sejalan dengan standar yang telah
          ditetapkan oleh GAPENSI.
        </p>
        <p className="mt-4 text-black px-10 text-xs text-justify">
          PT. Berkah Angsana Teknik terus berupaya menjadi mitra terpercaya
          dalam mendukung pembangunan dan pengembangan infrastruktur di
          Indonesia.
        </p>
        <p className="mt-4 px-10 text-left">------------</p>
        <p className="px-10 text-black text-sm text-left font-bold">
          Berkah Angsana
        </p>
        <div className="flex px-10 space-x-2 mt-2">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black hover:text-blue-500"
          >
            <FaFacebook size={20} />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black hover:text-blue-400"
          >
            <FaTwitter size={20} />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black hover:text-pink-500"
          >
            <FaInstagram size={20} />
          </a>
        </div>
        <div className="">
          <div className="flex text-black px-10 mt-4 text-[10px] px-10 text-left justify-end items-center gap-1">
            Supported by :
            <img
              src={"images/icon-outlook.svg"}
              alt="Outlook"
              style={{
                width: 16,
                height: 16,
                display: "inline-block",
                marginLeft: 4,
              }}
            />
            OutLook Project
          </div>
          <div className="flex px-10 space-x-2 mt-2 text-[10px] justify-end">
            <a
              href="https://wa.me/6281917250391"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:text-green-500"
            >
              <FaWhatsapp size={20} />
            </a>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=gibrangl1167@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:text-red-400"
            >
              <SiGmail size={20} />
            </a>
            <a
              href="https://www.instagram.com/outlookofficial_/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:text-pink-500 pb-4"
            >
              <FaInstagram size={20} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tentang;
