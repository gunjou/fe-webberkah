/* eslint-disable jsx-a11y/anchor-is-valid */
import { React, useEffect, useState } from "react";
import { Modal, Label, TextInput, Select } from "flowbite-react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { TbReload } from "react-icons/tb";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import api from "../../shared/Api";

// import SideMenu from './SideMenu'
// import NavMenu from './NavMenu'

const kolom = [
  { id: "no", label: "No", minWidth: 10 },
  { id: "nama", label: "Nama Pegawai", minWidth: 100 },
  { id: "jenis", label: "Jenis Pegawai", minWidth: 100 },
  { id: "tipe", label: "Tipe Pegawai", minWidth: 100 },
  {
    id: "username",
    label: "Username",
    minWidth: 100,
  },
  {
    id: "kode_pemulihan",
    label: "Kode Pemulihan",
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
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;
  const [searchTerm, setSearchTerm] = useState("");
  const [jenisList, setJenisList] = useState([]);
  const [tipeList, setTipeList] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [selectedPegawai, setSelectedPegawai] = useState({
    id_karyawan: "",
    nama: "",
    jenis: "",
    tipe: "",
    username: "",
    kode_pemulihan: "",
    gaji_pokok: "",
  });

  const [newPegawai, setNewPegawai] = useState({
    nama: "",
    jenis: "",
    tipe: "",
    username: "",
    kode_pemulihan: "",
    gaji_pokok: "",
  });

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const generateRandomString = (length = 6) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from(
      { length },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  };

  useEffect(() => {
    if (openModalAdd) {
      setNewPegawai((prev) => ({
        ...prev,
        kode_pemulihan: generateRandomString(6),
      }));
    }
  }, [openModalAdd]);

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    api
      .get("/tipe", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        // console.log(res.data.tipe_karyawan);
        setTipeList(res.data.tipe_karyawan);
      })
      .catch((err) => {
        console.error("Gagal mengambil data tipe pegawai:", err);
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

    setIsLoading(true); // mulai loading

    const payload = {
      nama: selectedPegawai.nama,
      jenis: selectedPegawai.jenis,
      tipe: selectedPegawai.tipe,
      username: selectedPegawai.username,
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
        setKaryawan((prev) =>
          prev.map((item) =>
            item.id_karyawan === selectedPegawai.id_karyawan
              ? { ...item, ...payload }
              : item
          )
        );
        alert(res.data.status || "Data karyawan berhasil diperbarui!");
        setOpenModalEdit(false);
        window.location.reload();
      })
      .catch((error) => {
        console.error(
          "Error updating data:",
          error.response?.data || error.message
        );
      })
      .finally(() => {
        setIsLoading(false); // selesai loading
      });
  };

  const hapusPegawai = () => {
    const konfirmasi = window.confirm(
      `Apakah Anda yakin ingin menghapus ${selectedPegawai.nama}?`
    );
    if (!konfirmasi) return; // jika user klik Cancel, fungsi berhenti di sini
    if (!selectedPegawai.id_karyawan) {
      alert("ID karyawan tidak valid!");
      return;
    }
    if (!selectedPegawai.jenis) {
      alert("Jenis pegawai tidak boleh kosong!");
      return;
    }

    const token = localStorage.getItem("token");
    api
      .put(`/karyawan/delete/${selectedPegawai.id_karyawan}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setKaryawan((prev) =>
          prev.map((item) =>
            item.id_karyawan === selectedPegawai.id_karyawan
              ? { ...item }
              : item
          )
        );
        alert("Data karyawan berhasil dihapus!");
        setOpenModalEdit(false);
        window.location.reload();
      })
      .catch((error) => {
        console.error(
          "Error hapus data:",
          error.response?.data || error.message
        );
      });
  };

  const saveAdd = () => {
    setIsAdding(true); // mulai loading

    const payloadAdd = {
      nama: newPegawai.nama,
      jenis: newPegawai.jenis,
      tipe: newPegawai.tipe,
      username: newPegawai.username,
      kode_pemulihan: newPegawai.kode_pemulihan,
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
        setKaryawan((prev) => [...prev, res.data]);
        setOpenModalAdd(false);
        setNewPegawai({
          nama: "",
          jenis: "",
          tipe: "",
          username: "",
          kode_pemulihan: "",
          gaji_pokok: "",
        }); // Reset form

        alert(res.data.status || "Data karyawan berhasil ditambahkan!");
        window.location.reload();
      })
      .catch((error) => {
        console.error(
          "Error adding data:",
          error.response?.data || error.message
        );
      })
      .finally(() => {
        setIsAdding(false); // selesai loading
      });
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...karyawan].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const valueA = a[sortConfig.key] || "";
    const valueB = b[sortConfig.key] || "";
    if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Filter data berdasarkan search term
  const filteredData = sortedData.filter((item) =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <TableRow key={index}>
        <TableCell>{indexOfFirstRow + index + 1}</TableCell>

        <TableCell component="th" scope="row" className="capitalize">
          {item.nama}
        </TableCell>
        <TableCell align="left" className="capitalize">
          {item.jenis}
        </TableCell>
        <TableCell align="left" className="capitalize">
          {item.tipe}
        </TableCell>

        <TableCell align="left">{item.username}</TableCell>
        <TableCell align="left">{item.kode_pemulihan}</TableCell>
        <TableCell align="left">{formatRupiah(item.gaji_pokok)}</TableCell>
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
    const jenisObj = jenisList.find((j) => j.jenis === karyawan.jenis);
    const tipeObj = tipeList.find((t) => t.tipe === karyawan.tipe);
    setSelectedPegawai({
      ...karyawan,
      jenis: jenisObj ? jenisObj.id_jenis : "", // pastikan nilainya ID
      tipe: tipeObj ? tipeObj.id_tipe : "",
    });
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
                          {kolom.map((column, index) => {
                            const isFirst = index === 0;
                            const isLast = index === kolom.length - 1;
                            return (
                              <TableCell
                                key={column.id}
                                onClick={() => handleSort(column.id)}
                                align={column.align}
                                style={{
                                  minWidth: column.minWidth,
                                  backgroundColor: "#4d4d4d",
                                  color: "white",
                                  fontWeight: "bold",
                                  borderTopLeftRadius: isFirst ? "10px" : "0",
                                  borderTopRightRadius: isLast ? "10px" : "0",
                                  border: "1px solid #4d4d4d", // <- ini yang penting
                                }}
                              >
                                {column.label}
                                {sortConfig.key === column.id && (
                                  <span style={{ marginLeft: 4 }}>
                                    {sortConfig.direction === "asc"
                                      ? " ▲"
                                      : " ▼"}
                                  </span>
                                )}
                              </TableCell>
                            );
                          })}
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
                    className="bg-gray-300 text-gray-700 hover:bg-gray-400 focus:ring-4 focus:ring-gray-200 font-medium rounded-l-[20px] text-[10px] px-2 py-1 border border-black"
                    onClick={prevPage}
                    disabled={currentPage === 1}
                  >
                    <GrFormPrevious />
                  </button>
                  <button
                    type="button"
                    className="bg-gray-300 text-gray-700 hover:bg-gray-400 focus:ring-4 focus:ring-gray-200 font-medium rounded-r-[20px] text-[10px] px-2 py-1 border border-black"
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
                        <Label htmlFor="tipe" value="Tipe Pegawai" />
                      </div>
                      <Select
                        id="tipe"
                        sizing="sm"
                        value={selectedPegawai.tipe}
                        onChange={(e) =>
                          setSelectedPegawai({
                            ...selectedPegawai,
                            tipe: parseInt(e.target.value),
                          })
                        }
                      >
                        <option value="">Pilih Tipe Pegawai</option>
                        {Array.isArray(tipeList) &&
                          tipeList.map((tipe) => (
                            <option key={tipe.id_tipe} value={tipe.id_tipe}>
                              {tipe.tipe}
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
                    {/* <div>
                      <div className="block mb-2">
                        <Label htmlFor="small" value="kode_pemulihan" />
                      </div>
                      <TextInput
                        id="kode_pemulihan"
                        type="text"
                        sizing="sm"
                        value={selectedPegawai.kode_pemulihan}
                        onChange={(e) =>
                          setSelectedPegawai({
                            ...selectedPegawai,
                            kode_pemulihan: e.target.value,
                          })
                        }
                      />
                    </div> */}
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
                      className="flex items-center gap-2 focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={saveEdit}
                      disabled={isLoading}
                    >
                      {isLoading && (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      )}
                      {isLoading ? "Menyimpan..." : "Simpan"}
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
                        onClick={hapusPegawai}
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
                        <Label htmlFor="tipe" value="Tipe Pegawai" />
                      </div>
                      <Select
                        id="tipe"
                        sizing="sm"
                        value={newPegawai.tipe}
                        onChange={(e) =>
                          setNewPegawai({
                            ...newPegawai,
                            tipe: parseInt(e.target.value),
                          })
                        }
                      >
                        <option value="">Pilih Tipe Pegawai</option>
                        {Array.isArray(tipeList) &&
                          tipeList.map((tipe) => (
                            <option key={tipe.id_tipe} value={tipe.id_tipe}>
                              {tipe.tipe}
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
                        <Label
                          htmlFor="kode_pemulihan"
                          value="Kode Pemulihan"
                        />
                      </div>
                      <div className="relative">
                        <TextInput
                          id="kode_pemulihan"
                          type="text"
                          sizing="sm"
                          value={newPegawai.kode_pemulihan}
                          onChange={(e) =>
                            setNewPegawai({
                              ...newPegawai,
                              kode_pemulihan: e.target.value,
                            })
                          }
                          className="pr-10" // beri ruang untuk icon di kanan
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setNewPegawai({
                              ...newPegawai,
                              kode_pemulihan: generateRandomString(6),
                            })
                          }
                          className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-800"
                          title="Generate kode_pemulihan baru"
                        >
                          <TbReload className="w-4 h-4" />
                        </button>
                      </div>
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
                    className="flex items-center gap-2 focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={saveAdd}
                    disabled={isAdding}
                  >
                    {isAdding && (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    )}
                    {isAdding ? "Menyimpan..." : "Simpan"}
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
