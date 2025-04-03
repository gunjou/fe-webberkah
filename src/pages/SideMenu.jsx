/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { Sidebar, SidebarLogo } from "flowbite-react";
import {
  FaUserFriends,
  FaClipboardList,
  FaClipboardCheck,
  FaMoneyCheckAlt,
  FaCalculator,
} from "react-icons/fa";
import { HiClipboardDocumentList } from "react-icons/hi2";
import { IoTimer } from "react-icons/io5";
import { HiOutlineMinus, HiOutlinePlus } from "react-icons/hi";

import { twMerge } from "tailwind-merge";
import { NavLink } from "react-router-dom";

const SideMenu = () => {
  return (
    <div className="SideMenu fixed top-0 left-0 z-50 border-r-lg border-black shadow-[50px] h-screen bg-blue-300 w-64">
      <Sidebar aria-label="Sidebar with multi-level dropdown example">
        <Sidebar.Items>
          <SidebarLogo href="#" className="flex items-center pl-0">
            <div className="flex">
              <img
                src={process.env.PUBLIC_URL + "images/logo.png"}
                className="mr-2 h-9"
                alt="Berkah Angsana Logo"
              />
              <span className="text-lg font-bold dark:text-white pt-1">
                Berkah Angsana
              </span>
            </div>
          </SidebarLogo>
          <Sidebar.ItemGroup className="text-gray-800">
            <NavLink to={"/pegawai"}>
              <Sidebar.Item icon={FaUserFriends}>
                <span className="left-14 flex">Data Pegawai</span>
              </Sidebar.Item>
            </NavLink>

            <Sidebar.Collapse
              icon={FaClipboardList}
              label="Absensi"
              renderChevronIcon={(theme, open) => {
                const IconComponent = open ? HiOutlineMinus : HiOutlinePlus;
                return (
                  <IconComponent
                    aria-hidden
                    className={twMerge(
                      theme.label.icon.open[open ? "on" : "off"]
                    )}
                  />
                );
              }}
            >
              <NavLink to={"/presensi"}>
                <Sidebar.Item icon={FaClipboardCheck}>
                  <span className="left-14 flex">Presensi</span>
                </Sidebar.Item>
              </NavLink>
              <NavLink to={"/rekapan"}>
                <Sidebar.Item icon={HiClipboardDocumentList}>
                  <span className="left-14 flex">Rekapan</span>
                </Sidebar.Item>
              </NavLink>
              <NavLink to={"/lembur"}>
                <Sidebar.Item icon={IoTimer}>
                  <span className="left-14 flex">Lembur</span>
                </Sidebar.Item>
              </NavLink>
            </Sidebar.Collapse>
            <NavLink to={"/perhitungan-gaji"}>
              <Sidebar.Item icon={FaCalculator}>
                <span className="left-14 flex">Perhitungan Gaji</span>
              </Sidebar.Item>
            </NavLink>
          </Sidebar.ItemGroup>
        </Sidebar.Items>
      </Sidebar>
    </div>
  );
};

export default SideMenu;
