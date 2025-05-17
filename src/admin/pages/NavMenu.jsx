import React, { useEffect, useState } from "react";
import {
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  Navbar,
  Modal,
  Button,
} from "flowbite-react";
import Avatar from "@mui/material/Avatar";
import { useNavigate } from "react-router-dom";
import { SiGmail } from "react-icons/si";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";

// Warna acak
const getRandomColor = () => {
  const colors = [
    "#F44336",
    "#E91E63",
    "#9C27B0",
    "#3F51B5",
    "#2196F3",
    "#009688",
    "#4CAF50",
    "#FF9800",
    "#795548",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Title case converter
const toTitleCase = (str) =>
  str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

const NavMenu = () => {
  const navigate = useNavigate();
  const namaAdminRaw = localStorage.getItem("nama") || "Admin";
  const namaAdmin = toTitleCase(namaAdminRaw);

  const [avatarColor, setAvatarColor] = useState("#3F51B5");
  const [openModal, setOpenModal] = useState(false); // Tambah state modal

  useEffect(() => {
    const savedColor = localStorage.getItem("avatarColor");
    if (savedColor) {
      setAvatarColor(savedColor);
    } else {
      const newColor = getRandomColor();
      localStorage.setItem("avatarColor", newColor);
      setAvatarColor(newColor);
    }
  }, []);

  // Ambil inisial maksimal 2 huruf
  const initials = namaAdminRaw
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="Navbar">
      <Navbar
        fluid
        className="bg-custom-merah w-full h-[72px] flex items-center justify-between"
      >
        <div className="flex items-center absolute right-0 mr-7 space-x-4 ml-auto">
          <Dropdown
            arrowIcon={false}
            inline
            className="min-w-fit max-w-xs"
            label={
              <Avatar sx={{ bgcolor: avatarColor, width: 40, height: 40 }}>
                {initials}
              </Avatar>
            }
          >
            <DropdownHeader>
              <span className="text-sm whitespace-nowrap">{namaAdmin}</span>
            </DropdownHeader>

            <DropdownItem onClick={() => setOpenModal(true)}>
              Tentang
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem
              onClick={() => {
                if (window.confirm("Apakah anda ingin keluar?")) {
                  localStorage.clear();
                  navigate("/login");
                }
              }}
            >
              Sign out
            </DropdownItem>
          </Dropdown>
          <div className="text-white">
            <div className="text-sm font-bold">{namaAdmin}</div>
            <div className="text-xs">Admin</div>
          </div>
        </div>
      </Navbar>

      {/* Modal Tentang */}
      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <Modal.Header>Tentang Aplikasi</Modal.Header>
        <Modal.Body>
          <div className="space-y-2 text-sm">
            <div>
              <b>Berkah Angsana (Admin) </b>
            </div>
            <div>
              Sistem manajemen absensi dan pegawai PT. Berkah Angsana Teknik.
            </div>
            <div>Supported by: OutLook Project</div>
            <div className="flex space-x-3 mt-2 text-[10px] justify-left">
              <a
                href="https://wa.me/6281917250391"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green-500"
              >
                <FaWhatsapp size={20} />
              </a>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=gibrangl1167@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-red-400"
              >
                <SiGmail size={20} />
              </a>
              <a
                href="https://www.instagram.com/outlookofficial_/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-500"
              >
                <FaInstagram size={20} />
              </a>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setOpenModal(false)}>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default NavMenu;
