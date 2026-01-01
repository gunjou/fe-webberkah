/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState, useRef } from "react";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import { useNavigate } from "react-router-dom";
import { SiGmail } from "react-icons/si";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import { IoMdNotificationsOutline } from "react-icons/io";
import dayjs from "dayjs";
import api from "../../shared/Api";

/* ======================
   UTILITIES
====================== */
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

const toTitleCase = (str) =>
  str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

const getPendingIzin = (list) =>
  list.filter((item) => item.status_izin?.toLowerCase() === "pending");

const getPendingLembur = (list) =>
  list.filter((item) => item.status_lembur?.toLowerCase() === "pending");

/* ======================
   COMPONENT
====================== */
const NavMenu = () => {
  const navigate = useNavigate();

  const namaAdminRaw = localStorage.getItem("nama") || "Admin";
  const namaAdmin = toTitleCase(namaAdminRaw);

  const [avatarColor, setAvatarColor] = useState("#3F51B5");
  const [openDropdown, setOpenDropdown] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [notifModal, setNotifModal] = useState(false);

  const [notifList, setNotifList] = useState([]);
  const [lemburList, setLemburList] = useState([]);

  /* ======================
     INIT
  ====================== */
  useEffect(() => {
    const savedColor = localStorage.getItem("avatarColor");
    const color = savedColor || getRandomColor();
    setAvatarColor(color);
    localStorage.setItem("avatarColor", color);

    fetchNotif();
    fetchLembur();
  }, []);

  const initials = namaAdminRaw
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  /* ======================
     AUTH
  ====================== */
  const handleLogout = async () => {
    try {
      await api.post("/logout/admin");
    } finally {
      localStorage.clear();
      window.location.replace("/login");
    }
  };

  /* ======================
     FETCH
  ====================== */
  const fetchNotif = async () => {
    const token = localStorage.getItem("token");
    const res = await api.get(`/izin/list`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifList(res.data.data || []);
  };

  const fetchLembur = async () => {
    const token = localStorage.getItem("token");
    const res = await api.get(`/lembur/list`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLemburList(res.data.data || []);
  };

  /* ======================
     UI
  ====================== */
  const badgeCount =
    getPendingIzin(notifList).length + getPendingLembur(lemburList).length;

  return (
    <>
      {/* NAVBAR */}
      <header className="fixed top-0 left-0 right-0 h-[56px] bg-custom-merah flex items-center justify-end px-4 z-40">
        <div className="flex items-center gap-3 relative">
          <Badge badgeContent={badgeCount} color="error">
            <IoMdNotificationsOutline
              size={22}
              className="text-white cursor-pointer hover:text-yellow-400"
              onClick={() => setNotifModal(true)}
            />
          </Badge>

          <Avatar
            sx={{ bgcolor: avatarColor, width: 32, height: 32 }}
            className="cursor-pointer"
            onClick={() => setOpenDropdown(!openDropdown)}
          >
            {initials}
          </Avatar>

          <div className="text-white leading-tight">
            <div className="text-sm font-semibold">{namaAdmin}</div>
            <div className="text-[10px] opacity-80">Admin</div>
          </div>

          {/* DROPDOWN */}
          {openDropdown && (
            <div className="absolute right-0 top-12 bg-white rounded-lg shadow w-44 text-sm z-50">
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => setOpenModal(true)}
              >
                Tentang Aplikasi
              </button>
              <button
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* MODAL NOTIFIKASI */}
      {notifModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[420px] p-4">
            <h3 className="font-semibold mb-3">Notifikasi</h3>

            <div className="max-h-64 overflow-y-auto text-sm">
              {badgeCount === 0 && (
                <div className="text-gray-500 text-center py-4">
                  Tidak ada notifikasi
                </div>
              )}

              {getPendingIzin(notifList).map((i) => (
                <div key={i.id} className="border-b py-2">
                  Izin pending — {i.nama}
                </div>
              ))}

              {getPendingLembur(lemburList).map((l) => (
                <div key={l.id} className="border-b py-2">
                  Lembur pending — {l.nama}
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setNotifModal(false)}
                className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TENTANG */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[420px] p-5">
            <h2 className="font-bold mb-2">Tentang Aplikasi</h2>
            <p className="text-sm">
              Sistem manajemen absensi dan pegawai PT. Berkah Angsana Teknik.
            </p>

            <div className="flex gap-3 mt-4">
              <FaWhatsapp size={20} />
              <SiGmail size={20} />
              <FaInstagram size={20} />
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setOpenModal(false)}
                className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavMenu;
