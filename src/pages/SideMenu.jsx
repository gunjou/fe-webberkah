/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import { Sidebar } from "flowbite-react";
import { FaUserFriends, FaClipboardList, FaClipboardCheck, FaMoneyCheckAlt } from "react-icons/fa";
import { HiClipboardDocumentList } from "react-icons/hi2";
import { IoTimer } from "react-icons/io5";
import { HiOutlineMinus, HiOutlinePlus } from "react-icons/hi";

import { twMerge } from "tailwind-merge";
import { NavLink } from 'react-router-dom';


const SideMenu = () => {
  return (
    <div className="SideMenu">
			<Sidebar aria-label="Sidebar with multi-level dropdown example">
      <Sidebar.Items>
        <Sidebar.ItemGroup>
          <NavLink to={"/pegawai"}>
            <Sidebar.Item icon={FaUserFriends}>
              <span className="left-14 flex">Profile Pegawai</span>
            </Sidebar.Item>
          </NavLink>
					<Sidebar.Collapse
            icon={FaClipboardList}
            label="Absensi"
            renderChevronIcon={(theme, open) => {
              const IconComponent = open ? HiOutlineMinus : HiOutlinePlus;
              return <IconComponent aria-hidden className={twMerge(theme.label.icon.open[open ? 'on' : 'off'])} />;
            }}
          >
            <NavLink to={"/presensi"}>
              <Sidebar.Item icon={FaClipboardCheck}><span className="left-14 flex">Presensi</span></Sidebar.Item>
            </NavLink>
            <NavLink to={"/rekapan"}>
              <Sidebar.Item icon={HiClipboardDocumentList}><span className="left-14 flex">Rekapan</span></Sidebar.Item>
            </NavLink>
            <NavLink to={"/lembur"}>
              <Sidebar.Item icon={IoTimer}><span className="left-14 flex">Lembur</span></Sidebar.Item>
            </NavLink>
          </Sidebar.Collapse>
          <NavLink to={"/perhitungan-gaji"}>
            <Sidebar.Item icon={FaMoneyCheckAlt}>
              <span className="left-14 flex">Perhitungan Gaji</span>
            </Sidebar.Item>
          </NavLink>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
		</div>
  )
}

export default SideMenu