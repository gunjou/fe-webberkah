/* eslint-disable jsx-a11y/anchor-is-valid */
import { React, useState } from "react";
import { Table, Modal, Label, TextInput } from "flowbite-react";
import { FaPlus, FaTrash, FaUserPlus } from "react-icons/fa";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import Table1 from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

function createData(nama, jenis, username, password, status) {
  return { nama, jenis, username, password, status };
}

const rows = [
  createData("Berkah Angsana", "Admin", "admin", "admin"),
  createData("Berkah Angsana", "Pegawai", "pegawai", "pegawai"),
  createData("Berkah Angsana", "HRD", "hrd", "hrd"),
  createData("Berkah Angsana", "Direktur", "direktur", "direktur"),
];
// import SideMenu from './SideMenu'
// import NavMenu from './NavMenu'

const Pegawai = () => {
  const [openModalAdd, setOpenModalAdd] = useState(false);
  const [openModalEdit, setOpenModalEdit] = useState(false);
  return (
    <div className="Pegawai ">
      {/* Navbar Sction */}
      {/* <NavMenu /> */}

      <div className="flex">
        {/* Sidebar Section */}
        {/* <SideMenu /> */}

        {/* Table List Pegawai */}
        <div className="w-full h-full">
          <div className="title flex text-2xl pt-4 pl-4 font-bold">
            Daftar Pegawai
          </div>
          <div className="tabel rounded-[20px] mt-4 mr-4 ml-4 shadow-md bg-white w-full h-full">
            {/* Search box */}
            <div className="ml-2 mb-6 pt-4 flex items-center justify-between">
              <span className="flex text-lg pl-2 font-semibold mr-[300px]">
                Detail Pegawai
              </span>
              <div className="relative">
                <input
                  type="text"
                  id="table-search-users"
                  className="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-[20px] w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
              <button
                type="button"
                className="flex items-center text-[12px] bg-black mr-4 text-white hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-[20px] px-4 py-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                onClick={() => setOpenModalAdd(true)}
              >
                <span className="text-xs pr-2">
                  <FaPlus />
                </span>
                Tambah Pegawai
              </button>
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
                          Jenis Pegawai
                        </TableCell>
                        <TableCell
                          align="left"
                          className="text-black font-bold"
                        >
                          Username
                        </TableCell>
                        <TableCell
                          align="left"
                          className="text-black font-bold"
                        >
                          Password
                        </TableCell>
                        <TableCell
                          align="center"
                          className="rounded-r-lg text-black font-bold"
                        >
                          Status
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
                          <TableCell align="left">{row.jenis}</TableCell>
                          <TableCell align="left">{row.username}</TableCell>
                          <TableCell align="left">{row.password}</TableCell>
                          <TableCell align="center">
                            <span
                              className="font-medium text-white hover:underline dark:text-cyan-500 cursor-pointer bg-custom-merah rounded-[20px] px-6 py-1"
                              onClick={() => setOpenModalEdit(true)}
                            >
                              Edit
                            </span>
                            {row.status}
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
            {/* End section table */}
            {/* start modal edit data section */}
            <>
              <Modal
                show={openModalEdit}
                onClose={() => setOpenModalEdit(false)}
              >
                <Modal.Header>Edit Data Pegawai</Modal.Header>
                <Modal.Body>
                  <form className="flex flex-col gap-3">
                    <div>
                      <div className="block mb-2">
                        <Label htmlFor="small" value="Nama Pegawai" />
                      </div>
                      <TextInput id="small" type="text" sizing="sm" />
                    </div>
                    <div>
                      <div className="block mb-2">
                        <Label htmlFor="small" value="Jenis Pegawai" />
                      </div>
                      <TextInput id="small" type="text" sizing="sm" />
                    </div>
                    <div>
                      <div className="block mb-2">
                        <Label htmlFor="small" value="Username" />
                      </div>
                      <TextInput id="small" type="text" sizing="sm" />
                    </div>
                    <div>
                      <div className="block mb-2">
                        <Label htmlFor="small" value="Password" />
                      </div>
                      <TextInput id="small" type="text" sizing="sm" />
                    </div>
                    <div>
                      <div className="block mb-2">
                        <Label htmlFor="small" value="Gaji Pokok" />
                      </div>
                      <TextInput
                        id="small"
                        type="text"
                        sizing="sm"
                        placeholder="contoh: 1000000"
                      />
                    </div>
                  </form>
                </Modal.Body>
                <Modal.Footer>
                  <div className="button-footer flex gap-2">
                    <button
                      type="button"
                      className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                      onClick={() => setOpenModalEdit(false)}
                    >
                      Simpan
                    </button>
                    <button
                      type="button"
                      class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                      onClick={() => setOpenModalEdit(false)}
                    >
                      Batal
                    </button>
                    <div className="absolute right-5">
                      <button
                        type="button"
                        className="flex focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-3 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                        onClick={() => setOpenModalAdd(false)}
                      >
                        <span className="text-lg pr-2">
                          <FaTrash />
                        </span>
                        Hapus Pegawai
                      </button>
                    </div>
                  </div>
                </Modal.Footer>
              </Modal>
            </>
            {/* end edit data section */}
            {/* start modal add data section */}
            <>
              <Modal show={openModalAdd} onClose={() => setOpenModalAdd(false)}>
                <Modal.Header>Isi Data Pegawai</Modal.Header>
                <Modal.Body>
                  <form className="flex flex-col gap-3">
                    <div>
                      <div className="block mb-2">
                        <Label htmlFor="small" value="Nama Pegawai" />
                      </div>
                      <TextInput id="small" type="text" sizing="sm" />
                    </div>
                    <div>
                      <div className="block mb-2">
                        <Label htmlFor="small" value="Jenis Pegawai" />
                      </div>
                      <TextInput id="small" type="text" sizing="sm" />
                    </div>
                    <div>
                      <div className="block mb-2">
                        <Label htmlFor="small" value="Username" />
                      </div>
                      <TextInput id="small" type="text" sizing="sm" />
                    </div>
                    <div>
                      <div className="block mb-2">
                        <Label htmlFor="small" value="Gaji Pokok" />
                      </div>
                      <TextInput
                        id="small"
                        type="text"
                        sizing="sm"
                        placeholder="contoh: 1000000"
                      />
                    </div>
                  </form>
                </Modal.Body>
                <Modal.Footer>
                  <button
                    type="button"
                    className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                    onClick={() => setOpenModalAdd(false)}
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                    onClick={() => setOpenModalAdd(false)}
                  >
                    Batal
                  </button>
                </Modal.Footer>
              </Modal>
            </>
            {/* end add data section */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pegawai;
