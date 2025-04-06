/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
// import NavMenu from './NavMenu'
// import SideMenu from './SideMenu'
import { Dropdown, DropdownDivider, DropdownItem } from "flowbite-react";
import { IoIosArrowDown } from "react-icons/io";

import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import Table1 from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

function createData(nama, tanggal, jamKerStd, jmlhJamKer, selisihJamKer) {
  return {
    nama,
    tanggal,
    jamKerStd,
    jmlhJamKer,
    selisihJamKer,
  };
}

const rows = [
  createData("Septian Wahyu", "v", "3240", "3240", "200"),
  createData("Guguun Joefandi", "v", "3240", "3240", "200"),
  createData("Gibran", "v", "3240", "3240", "200"),
];

const Rekapan = () => {
  return (
    <div className="Rekapan">
      {/* Navbar Sction */}
      {/* <NavMenu /> */}

      <div className="flex">
        {/* Sidebar Section */}
        {/* <SideMenu /> */}

        {/* Table List Pegawai */}
        <div className="w-full h-full">
          <div className="title flex text-2xl pt-4 pl-4 font-bold">
            Rekapan Absensi
          </div>
          <div className="tabel rounded-[20px] mt-4 mr-4 ml-4 px-2 shadow-md bg-white w-full h-full">
            {/* Search box */}
            <div className="ml-2 mb-6 pt-4 flex items-center justify-between">
              <span className="flex text-lg pl-2 font-semibold mr-[300px]">
                Tabel Rekapan
              </span>
              {/* <!-- Dropdown menu --> */}
              <div className="flex">
                <Dropdown
                  arrowIcon={false}
                  inline
                  label={
                    <button
                      type="button"
                      className="flex p-3 mt-3.5 ml-2 focus:outline-none bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 focus:ring-4 focus:ring-green-300 font-medium rounded-[20px] text-sm px-3 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                    >
                      Jenis Pegawai
                      <span className="text-sm pl-2 mt-0.5">
                        <IoIosArrowDown />
                      </span>
                    </button>
                  }
                >
                  <DropdownItem>Semua Pegawai</DropdownItem>
                  <DropdownDivider />
                  <DropdownItem>Staf Kantor</DropdownItem>
                  <DropdownItem>Pegawai Lapangan</DropdownItem>
                  <DropdownItem>Cleaning Service</DropdownItem>
                </Dropdown>
              </div>
              {/* <!-- end Dropdown menu --> */}
              <div className="relative">
                <input
                  type="text"
                  id="table-search-users"
                  className="block p-3 ps-10 text-sm text-gray-900 border border-gray-300 rounded-[20px] w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Search"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            {/* end search box */}
            <div className="overflow-x-auto pl-2">
              <div className="bg-white rounded-lg shadow-md mr-2">
                <TableContainer component={Paper}>
                  <Table1 sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead className="bg-[#e8ebea]">
                      <TableRow>
                        <TableCell className="rounded-l-lg text-black font-bold">
                          Nama Pegawai
                        </TableCell>
                        <TableCell
                          align="left"
                          className="text-black font-bold"
                        >
                          Tanggal
                        </TableCell>
                        <TableCell
                          align="left"
                          className="text-black font-bold"
                        >
                          Jam Kerja Standar
                        </TableCell>
                        <TableCell
                          align="left"
                          className="text-black font-bold"
                        >
                          Jumlah Jam Kerja
                        </TableCell>
                        <TableCell
                          align="left"
                          className="rounded-r-lg text-black font-bold"
                        >
                          Selisih Jam Kerja
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody className="text-red">
                      {rows.map((row) => (
                        <TableRow
                          key={row.nama}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell component="th" scope="row">
                            {row.nama}
                          </TableCell>
                          <TableCell align="left">{row.tanggal}</TableCell>
                          <TableCell align="left">{row.jamKerStd}</TableCell>
                          <TableCell align="left">{row.jmlhJamKer}</TableCell>
                          <TableCell align="left">
                            {row.selisihJamKer}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table1>
                </TableContainer>
              </div>
              {/* Tombol Next dan Prev dengan keterangan halaman */}
              <div className="flex justify-between items-center mt-4 px-4">
                {/* Keterangan Halaman */}
                <span className="text-sm text-gray-500">
                  Showing 1-12 of 100
                </span>

                {/* Tombol Next dan Prev */}
                <div className="flex items-center pb-3 px-4">
                  <button
                    type="button"
                    className="bg-gray-300 text-gray-700 hover:bg-gray-400 focus:ring-4 focus:ring-gray-200 font-medium rounded-l-[20px] text-xs px-4 py-2 border border-black"
                  >
                    <GrFormPrevious />
                  </button>
                  <button
                    type="button"
                    className="bg-gray-300 text-gray-700 hover:bg-gray-400 focus:ring-4 focus:ring-gray-200 font-medium rounded-r-[20px] text-xs px-4 py-2 border border-black"
                  >
                    <GrFormNext />
                  </button>
                </div>
              </div>
            </div>

            {/* end add data section */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rekapan;
