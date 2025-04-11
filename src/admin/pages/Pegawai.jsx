/* eslint-disable jsx-a11y/anchor-is-valid */
import { React, useEffect, useState } from "react";
import { Modal, Label, TextInput, Select } from "flowbite-react";
import { FaPause, FaPlus, FaTrash, FaUserPlus } from "react-icons/fa";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import axios from "axios";
import api from "../../shared/Api";

// import SideMenu from './SideMenu'
// import NavMenu from './NavMenu'

const kolom = [
  { id: "nama", label: "Nama Pegawai", minWidth: 100 },
  { id: "status", label: "Status Pegawai", minWidth: 100 },
  {
    id: "username",
    label: "Username",
    minWidth: 100,
  },
  {
    id: "password",
    label: "Password",
    minWidth: 100,
  },
  {
    id: "gaji_pokok",
    label: "Gaji Pokok",
    minWidth: 100,
  },
  {
    id: "aksi",
    label: "Aksi",
    minWidth: 50,
    align: "center",
    fontWeight: "bold",
  },
];

const Pegawai = () => {
  const [openModalAdd, setOpenModalAdd] = useState(false);
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [karyawan, setKaryawan] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [searchTerm, setSearchTerm] = useState("");
  const [jenisList, setJenisList] = useState([]);

  const [selectedPegawai, setSelectedPegawai] = useState({
    id_karyawan: "",
    nama: "",
    jenis: "",
    username: "",
    password: "",
    gaji_pokok: "",
  });

  const [newPegawai, setNewPegawai] = useState({
    nama: "",
    jenis: "",
    username: "",
    password: "",
    gaji_pokok: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    api
      .get("/jenis", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setJenisList(res.data.jenis_karyawan);
        // console.log(res.data);
      })
      .catch((err) => {
        console.error("Gagal mengambil data jenis pegawai:", err);
      });
  }, []);

  // Fetch data from API
  useEffect(() => {
    const token = localStorage.getItem("token");
    api
      .get("/karyawan", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const sorted = res.data.karyawan
          .filter((item) => item.nama) // optional: filter kalau nama tidak null
          .sort((a, b) => a.nama.localeCompare(b.nama));

        setKaryawan(sorted);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const saveEdit = () => {
    if (!selectedPegawai.id_karyawan) {
      alert("ID karyawan tidak valid!");
      return;
    }
    if (!selectedPegawai.jenis) {
      alert("Jenis pegawai tidak boleh kosong!");
      return;
    }
    const payload = {
      nama: selectedPegawai.nama,
      jenis: selectedPegawai.jenis,
      username: selectedPegawai.username,
      password: selectedPegawai.password,
      gaji_pokok: selectedPegawai.gaji_pokok,
    };

    const token = localStorage.getItem("token");
    api
      .put(`karyawan/${selectedPegawai.id_karyawan}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        alert("Data karyawan berhasil diperbarui!");
        setKaryawan((prev) =>
          prev.map((item) =>
            item.id_karyawan === selectedPegawai.id_karyawan
              ? { ...item, ...payload }
              : item
          )
        );
        setOpenModalEdit(false);
      })
      .catch((error) => {
        console.error(
          "Error updating data:",
          error.response?.data || error.message
        );
      });
  };

  const saveAdd = () => {
    const payloadAdd = {
      nama: newPegawai.nama,
      jenis: newPegawai.jenis,
      username: newPegawai.username,
      password: newPegawai.password,
      gaji_pokok: newPegawai.gaji_pokok,
    };

    const token = localStorage.getItem("token");
    api
      .post("/karyawan", payloadAdd, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        alert("Data karyawan berhasil ditambahkan!");
        setKaryawan((prev) => [...prev, res.data]);
        setOpenModalAdd(false);
        setNewPegawai({
          nama: "",
          jenis: "",
          username: "",
          password: "",
          gaji_pokok: "",
        }); // Reset form
      })
      .catch((error) => {
        console.error(
          "Error adding data:",
          error.response?.data || error.message
        );
      });
  };

  // Filter data berdasarkan search term
  const filteredData = karyawan
    .filter((item) =>
      item.nama.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aMatches = a.nama
        .toLowerCase()
        .startsWith(searchTerm.toLowerCase());
      const bMatches = b.nama
        .toLowerCase()
        .startsWith(searchTerm.toLowerCase());
      return bMatches - aMatches; // Prioritaskan yang cocok di depan
    });

  // Hitung indeks data yang akan ditampilkan
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = searchTerm
    ? filteredData.slice(0, rowsPerPage) // Tampilkan hanya halaman pertama
    : filteredData.slice(indexOfFirstRow, indexOfLastRow);

  // Fungsi untuk mengganti halaman
  const nextPage = () => {
    if (currentPage < Math.ceil(karyawan.length / rowsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  var detail = "";
  if (currentRows.length === 0) {
    detail = (
      <TableRow>
        <TableCell colSpan={kolom.length} align="center">
          Tidak ada yang cocok dengan pencarian Anda.
        </TableCell>
      </TableRow>
    );
  } else {
    detail = currentRows.map((item, index) => (
      <TableRow
        key={index}
        sx={{
          "&:last-child td, &:last-child th": { border: 0 },
        }}
      >
        <TableCell component="th" scope="row" className="capitalize">
          {item.nama}
        </TableCell>
        <TableCell align="left" className="capitalize">
          {item.jenis}
        </TableCell>

        <TableCell align="left">{item.username}</TableCell>
        <TableCell align="left">{item.password}</TableCell>
        <TableCell align="left">{item.gaji_pokok}</TableCell>
        <TableCell align="center">
          <span
            className="font-medium text-white hover:underline dark:text-cyan-500 cursor-pointer bg-custom-merah rounded-[20px] px-6 py-1"
            onClick={() => handleEdit(item)} // Panggil handleEdit
          >
            Edit
          </span>
        </TableCell>
      </TableRow>
    ));
  }
  const handleEdit = (karyawan) => {
    setSelectedPegawai(karyawan);
    setOpenModalEdit(true);
  };

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
          <div className="tabel rounded-[20px] mt-4 mr-4 ml-4 px-2 shadow-md bg-white w-full h-full">
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
                  searchTerm={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
              <div className="bg-white rounded-lg shadow-md mr-2 overflow-y-auto max-h-[300px] ">
                <Paper sx={{ width: "100%", overflow: "hidden" }}>
                  <TableContainer sx={{ maxHeight: 300 }}>
                    <Table stickyHeader aria-label="sticky table">
                      <TableHead className="bg-[#e8ebea]">
                        <TableRow>
                          {kolom.map((column, index) => (
                            <TableCell
                              key={column.id}
                              align={column.align}
                              style={{
                                minWidth: column.minWidth,
                                backgroundColor: "#4d4d4d", // Ganti warna latar belakang
                                color: "white", // Ganti warna teks
                                fontWeight: "bold",
                                borderRadius: index === 5 ? "0 10px 0 0" : "0",
                              }}
                            >
                              {column.label}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody className="text-red">{detail}</TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </div>
              {/* Tombol Next dan Prev dengan keterangan halaman */}
              <div className="flex justify-between items-center mt-4 px-4">
                {/* Keterangan Halaman */}
                <span className="text-sm text-gray-500">
                  Showing {indexOfFirstRow + 1}-
                  {Math.min(indexOfLastRow, karyawan.length)} of{" "}
                  {karyawan.length}
                </span>

                {/* Tombol Next dan Prev */}
                <div className="flex items-center pb-3 px-4">
                  <button
                    type="button"
                    className="bg-gray-300 text-gray-700 hover:bg-gray-400 focus:ring-4 focus:ring-gray-200 font-medium rounded-l-[20px] text-xs px-4 py-2 border border-black"
                    onClick={prevPage}
                    disabled={currentPage === 1}
                  >
                    <GrFormPrevious />
                  </button>
                  <button
                    type="button"
                    className="bg-gray-300 text-gray-700 hover:bg-gray-400 focus:ring-4 focus:ring-gray-200 font-medium rounded-r-[20px] text-xs px-4 py-2 border border-black"
                    onClick={nextPage}
                    disabled={
                      currentPage === Math.ceil(karyawan.length / rowsPerPage)
                    }
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
                      <TextInput
                        id="nama"
                        type="text"
                        sizing="sm"
                        value={selectedPegawai.nama}
                        onChange={(e) =>
                          setSelectedPegawai({
                            ...selectedPegawai,
                            nama: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <div className="block mb-2">
                        <Label htmlFor="jenis" value="Jenis Pegawai" />
                      </div>
                      <Select
                        id="jenis"
                        sizing="sm"
                        value={selectedPegawai.jenis}
                        onChange={(e) =>
                          setSelectedPegawai({
                            ...selectedPegawai,
                            jenis: parseInt(e.target.value),
                          })
                        }
                      >
                        <option value="">Pilih Jenis Pegawai</option>
                        {Array.isArray(jenisList) &&
                          jenisList.map((jenis) => (
                            <option key={jenis.id_jenis} value={jenis.id_jenis}>
                              {jenis.jenis}
                            </option>
                          ))}
                      </Select>
                    </div>
                    <div>
                      <div className="block mb-2">
                        <Label htmlFor="small" value="Username" />
                      </div>
                      <TextInput
                        id="username"
                        type="text"
                        sizing="sm"
                        value={selectedPegawai.username}
                        onChange={(e) =>
                          setSelectedPegawai({
                            ...selectedPegawai,
                            username: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <div className="block mb-2">
                        <Label htmlFor="small" value="Password" />
                      </div>
                      <TextInput
                        id="password"
                        type="text"
                        sizing="sm"
                        value={selectedPegawai.password}
                        onChange={(e) =>
                          setSelectedPegawai({
                            ...selectedPegawai,
                            password: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <div className="block mb-2">
                        <Label htmlFor="small" value="Gaji Pokok" />
                      </div>
                      <TextInput
                        id="gajiPokok"
                        type="number"
                        sizing="sm"
                        value={selectedPegawai.gaji_pokok}
                        onChange={(e) =>
                          setSelectedPegawai({
                            ...selectedPegawai,
                            gaji_pokok: e.target.value,
                          })
                        }
                        //placeholder="contoh: 1000000"
                      />
                    </div>
                  </form>
                </Modal.Body>
                <Modal.Footer>
                  <div className="button-footer flex gap-2">
                    <button
                      type="button"
                      className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                      onClick={saveEdit} // Panggil fungsi saveEdit
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
                      <TextInput
                        id="small"
                        type="text"
                        sizing="sm"
                        value={newPegawai.nama}
                        onChange={(e) =>
                          setNewPegawai({ ...newPegawai, nama: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <div className="block mb-2">
                        <Label htmlFor="jenis" value="Jenis Pegawai" />
                      </div>
                      <Select
                        id="jenis"
                        sizing="sm"
                        value={newPegawai.jenis}
                        onChange={(e) =>
                          setNewPegawai({
                            ...newPegawai,
                            jenis: parseInt(e.target.value),
                          })
                        }
                      >
                        <option value="">Pilih Jenis Pegawai</option>
                        {Array.isArray(jenisList) &&
                          jenisList.map((jenis) => (
                            <option key={jenis.id_jenis} value={jenis.id_jenis}>
                              {jenis.jenis}
                            </option>
                          ))}
                      </Select>
                    </div>
                    <div>
                      <div className="block mb-2">
                        <Label htmlFor="small" value="Username" />
                      </div>
                      <TextInput
                        id="small"
                        type="text"
                        sizing="sm"
                        value={newPegawai.username}
                        onChange={(e) =>
                          setNewPegawai({
                            ...newPegawai,
                            username: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <div className="block mb-2">
                        <Label htmlFor="small" value="Password" />
                      </div>
                      <TextInput
                        id="small"
                        type="text"
                        sizing="sm"
                        value={newPegawai.password}
                        onChange={(e) =>
                          setNewPegawai({
                            ...newPegawai,
                            password: e.target.value,
                          })
                        }
                      />
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
                        value={newPegawai.gaji_pokok}
                        onChange={(e) =>
                          setNewPegawai({
                            ...newPegawai,
                            gaji_pokok: e.target.value,
                          })
                        }
                      />
                    </div>
                  </form>
                </Modal.Body>
                <Modal.Footer>
                  <button
                    type="button"
                    className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                    onClick={saveAdd}
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
