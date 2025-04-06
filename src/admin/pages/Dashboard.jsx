import React from "react";

import SideMenu from "./SideMenu";
import NavMenu from "./NavMenu";
import Pegawai from "./Pegawai";
import Presensi from "./Presensi";
import Rekapan from "./Rekapan";
import Lembur from "./Lembur";
import PerhitunganGaji from "./PerhitunganGaji";

const Dashboard = ({ type }) => {
  let content;

  switch (type) {
    case "profile-pegawai":
      content = <Pegawai />;
      break;
    case "presensi":
      content = <Presensi />;
      break;
    case "rekapan":
      content = <Rekapan />;
      break;
    case "lembur":
      content = <Lembur />;
      break;
    case "perhitungan-gaji":
      content = <PerhitunganGaji />;
      break;
    default:
      content = <Pegawai />; // Konten default jika tidak ada case yang cocok
      break;
  }

  return (
    <div className="Dashboard ml-64 bg-white- min-h-screen">
      {/* Navbar Section */}
      <NavMenu />
      <div className="flex">
        {/* Sidebar section */}
        <SideMenu className="sticky" />
        {content}
      </div>
    </div>
  );
};

export default Dashboard;
