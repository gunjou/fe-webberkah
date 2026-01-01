/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaUserFriends,
  FaClipboardList,
  FaClipboardCheck,
  FaCalculator,
} from "react-icons/fa";
import { HiClipboardDocumentList } from "react-icons/hi2";
import { IoTimer } from "react-icons/io5";
import { HiOutlineMinus, HiOutlinePlus } from "react-icons/hi";
import { MdLeaderboard } from "react-icons/md";
import { FaMoneyCheckDollar } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";

const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      twMerge(
        "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition",
        isActive
          ? "bg-blue-600 text-white"
          : "text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700"
      )
    }
  >
    <Icon className="text-lg shrink-0" />
    <span>{label}</span>
  </NavLink>
);

const SideMenu = () => {
  const [openAbsensi, setOpenAbsensi] = useState(true);

  return (
    <aside className="fixed top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-gray-900 border-r shadow-lg">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-3 border-b dark:border-gray-700">
        <img
          src={process.env.PUBLIC_URL + "images/logo.png"}
          alt="Berkah Angsana"
          className="h-8 w-7 object-contain"
        />
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          Berkah Angsana
        </span>
      </div>

      {/* Menu */}
      <nav className="px-3 py-4 space-y-1">
        {/* Absensi Collapse */}
        <button
          onClick={() => setOpenAbsensi(!openAbsensi)}
          className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700 transition"
        >
          <div className="flex items-center gap-3">
            <FaClipboardList className="text-lg" />
            <span className="text-sm font-medium">Absensi</span>
          </div>
          {openAbsensi ? <HiOutlineMinus /> : <HiOutlinePlus />}
        </button>

        {openAbsensi && (
          <div className="ml-6 mt-1 space-y-1">
            <NavItem to="/presensi" icon={FaClipboardCheck} label="Presensi" />
            <NavItem
              to="/rekapan"
              icon={HiClipboardDocumentList}
              label="Rekapan"
            />
            <NavItem to="/lembur" icon={IoTimer} label="Lembur" />
            <NavItem
              to="/leaderboard"
              icon={MdLeaderboard}
              label="Leaderboard"
            />
          </div>
        )}

        <div className="pt-2 space-y-1">
          <NavItem
            to="/perhitungan-gaji"
            icon={FaCalculator}
            label="Perhitungan Gaji"
          />
          <NavItem
            to="/hutang-pegawai"
            icon={FaMoneyCheckDollar}
            label="Hutang Pegawai"
          />
          <NavItem to="/pegawai" icon={FaUserFriends} label="Data Pegawai" />
        </div>
      </nav>
    </aside>
  );
};

export default SideMenu;
