import React from "react";

import SideMenu from "./SideMenu";
import NavMenu from "./NavMenu";
import Pegawai from "./Pegawai";
import Presensi from "./Presensi";
import Rekapan from "./Rekapan";
import Lembur from "./Lembur";
import PerhitunganGaji from "./PerhitunganGaji";
import Leaderboard from "./Leaderboard";
import HutangPegawai from "./HutangPegawai";

const NAVBAR_HEIGHT = 56; // samakan dengan NavMenu
const SIDEBAR_WIDTH = 259; // w-64

const Dashboard = ({ type }) => {
  let content;

  switch (type) {
    case "presensi":
      content = <Presensi />;
      break;
    case "profile-pegawai":
      content = <Pegawai />;
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
    case "hutang-pegawai":
      content = <HutangPegawai />;
      break;
    case "leaderboard":
      content = <Leaderboard />;
      break;
    default:
      content = <Presensi />;
      break;
  }

  return (
    <>
      {/* NAVBAR (fixed) */}
      <NavMenu />

      {/* SIDEBAR (fixed) */}
      <SideMenu />

      {/* CONTENT */}
      <main
        className="min-h-screen bg-white"
        style={{
          paddingTop: NAVBAR_HEIGHT,
          paddingLeft: SIDEBAR_WIDTH,
        }}
      >
        {content}
      </main>
    </>
  );
};

export default Dashboard;
