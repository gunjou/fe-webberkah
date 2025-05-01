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
      <h1 className="text-2xl font-bold mt-10">Tentang</h1>
      <p className="mt-4 px-10 text-justify">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Pariatur
        deleniti dolorum voluptas rem ratione aperiam nemo voluptate labore
        consectetur! Optio molestiae eligendi deserunt sequi fuga sed iusto
        temporibus fugiat laborum! Lorem ipsum dolor sit amet consectetur,
        adipisicing elit. Necessitatibus minus provident, praesentium at
        officiis suscipit asperiores natus ducimus. Aliquam cupiditate rerum
        doloribus pariatur, beatae corrupti perspiciatis excepturi aspernatur
        hic quod!
      </p>
      <p className="mt-4 px-10 text-justify">
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sed excepturi
        atque quos asperiores cum eveniet id nihil totam quod. Rem aspernatur
        culpa sunt? Nostrum quas tempora sunt porro quod. Numquam.
      </p>
      <p className="mt-4 px-10 text-left">------------</p>
      <p className="px-10 text-left font-bold">Berkah Angsana</p>
      <div className="flex px-10 space-x-4 mt-2">
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-blue-500"
        >
          <FaFacebook size={20} />
        </a>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-blue-400"
        >
          <FaTwitter size={20} />
        </a>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-pink-500"
        >
          <FaInstagram size={20} />
        </a>
      </div>
      <div className="fixed bottom-0 right-0 m-4 ">
        <div className="mt-4 text-[10px] px-10 text-left">
          Supported by : OutLook
        </div>
        <div className="flex px-10 space-x-2 mt-2 text-[10px] justify-right ">
          <a
            href="https://wa.me/6281917250391"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-green-500"
          >
            <FaWhatsapp size={20} />
          </a>
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=gibrangl1167@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-red-400"
          >
            <SiGmail size={20} />
          </a>
          <a
            href="https://www.instagram.com/outlookofficial_/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-pink-500"
          >
            <FaInstagram size={20} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Tentang;
