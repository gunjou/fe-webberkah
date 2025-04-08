import { React, useState, useEffect } from "react";
import { Card } from "flowbite-react";
import { PiOfficeChairBold } from "react-icons/pi";
import { FaHelmetSafety } from "react-icons/fa6";
import { MdCleaningServices } from "react-icons/md";
import { ImCross } from "react-icons/im";
import axios from "axios";

// import NavMenu from './NavMenu'
// import SideMenu from './SideMenu'
import { FaCheck, FaPlus } from "react-icons/fa";
import ModalHadir from "../components/ModalHadir";

const Presensi = () => {
  const [openHadir, setOpenHadir] = useState(false);
  const handleOpenHadir = () => setOpenHadir(true);
  const handleCloseHadir = () => setOpenHadir(false);
  const [absen, setAbsen] = useState([]);
  const [karyawan, setKaryawan] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // Data yang difilter
  const [searchTerm, setSearchTerm] = useState(""); // Nilai input pencarian

  useEffect(() => {
    setFilteredData(absen, karyawan); // Reset filteredData ke data asli saat modal dibuka
    setSearchTerm(""); // Reset nilai pencarian
  }, [absen, karyawan]);

  useEffect(() => {
    axios
      .get("https://api.berkahangsana.online/karyawan")
      .then((res) => {
        const sorted = res.data.karyawan
          .filter((item) => item.nama) // optional: filter kalau nama tidak null
          .sort((a, b) => a.nama.localeCompare(b.nama));

        setKaryawan(sorted);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("https://api.berkahangsana.online/absensi", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setAbsen(res.data.absensi);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  return (
    <div className="Presensi">
      {/* Header */}
      {/* <NavMenu /> */}
      <div className="Body flex">
        {/* <SideMenu /> */}
        {/* Dashboard Presensi */}
        <div>
          <div className="title flex text-2xl pt-4 pl-4 font-bold">
            Persensi Semua Pegawai
          </div>
          <div className="flex space-x-4 px-2 py-3 justify-center rounded-[20px]">
            <div className="card h-50 w-80">
              <Card
                href="#"
                onClick={handleOpenHadir}
                className="cursor-pointer relative"
              >
                <div className="absolute top-4 left-5">
                  <h5 className="text-lg font-normal tracking-tight text-gray-900 dark:text-white">
                    Hadir
                  </h5>
                </div>
                <div className="mt-7 text-left ml-0">
                  <p className="font-bold text-2xl text-black-700 dark:text-gray-400">
                    {absen.length}/
                    {karyawan.filter((item) => item.id_karyawan).length - 2}
                  </p>
                  <p className="font-normal text-red-700 dark:text-gray-400">
                    Orang
                  </p>
                </div>
                <span className="flex items-center justify-center absolute top-4 right-4 text-blue-700 text-3xl text-center w-8 h-8 rounded-md bg-blue-400">
                  <FaCheck className="h-6 w-6" />
                </span>
              </Card>
              <ModalHadir open={openHadir} close={handleCloseHadir} />
            </div>
            <div className="card h-50 w-80">
              <div className="card">
                <Card href="#" className="cursor-pointer relative">
                  <div className="absolute top-4 left-5">
                    <h5 className="text-lg font-normal tracking-tight text-gray-900 dark:text-white">
                      Izin/Sakit
                    </h5>
                  </div>
                  <div className="mt-7 text-left ml-0">
                    <p className="font-bold text-2xl text-black-700 dark:text-gray-400">
                      -/
                      {karyawan.filter((item) => item.id_karyawan).length - 2}
                    </p>
                    <p className="font-normal text-red-700 dark:text-gray-400">
                      Orang
                    </p>
                  </div>
                  <span className="flex items-center justify-center absolute top-4 right-4 text-green-700 text-3xl text-center w-8 h-8 rounded-md bg-green-400">
                    <FaPlus className="h-6 w-6" />
                  </span>
                </Card>
              </div>
            </div>
            <div className="card h-50 w-80">
              <div className="card">
                <Card href="#" className="cursor-pointer relative">
                  <div className="absolute top-4 left-5">
                    <h5 className="text-lg font-normal tracking-tight text-gray-900 dark:text-white">
                      Tanpa Keterangan
                    </h5>
                  </div>
                  <div className="mt-7 text-left ml-0">
                    <p className="font-bold text-2xl text-black-700 dark:text-gray-400">
                      {karyawan.filter((item) => item.id_karyawan).length -
                        2 -
                        absen.length}
                      /{karyawan.filter((item) => item.id_karyawan).length - 2}
                    </p>
                    <p className="font-normal text-red-700 dark:text-gray-400">
                      Orang
                    </p>
                  </div>
                  <span className="flex items-center justify-center absolute top-4 right-4 text-red-700 text-3xl text-center w-8 h-8 rounded-md bg-red-400">
                    <ImCross className="h-6 w-6" />
                  </span>
                </Card>
              </div>
            </div>
          </div>
          {/* Baris 2 */}
          <div className="title flex text-2xl pt-4 pl-4 font-bold">
            Persensi Departemen Pegawai
          </div>

          <div className="flex space-x-4 px-2 py-3 justify-center rounded-[20px]">
            {/* Staff Kantor  */}
            <div className="card h-50 w-80">
              <Card href="#" className="cursor-pointer relative">
                <div className="absolute top-4 left-5">
                  <h5 className="text-lg font-normal tracking-tight text-gray-900 dark:text-white">
                    Staff Kantor
                  </h5>
                </div>
                <div className="mt-7 text-left ml-0">
                  <p className="font-bold text-2xl text-black-700 dark:text-gray-400">
                    {absen.filter((item) => item.id_jenis == 4).length}/
                    {karyawan.filter((item) => item.id_jenis === 4).length}
                  </p>
                  <p className="font-normal text-red-700 dark:text-gray-400">
                    Orang
                  </p>
                </div>
                <span className="flex items-center justify-center absolute top-4 right-4 text-yellow-700 text-3xl text-center w-8 h-8 rounded-md bg-yellow-400">
                  <PiOfficeChairBold className="h-6 w-6" />
                </span>
              </Card>
            </div>
            {/* Pegawai Lapangan */}
            <div className="card h-50 w-80">
              <Card href="#" className="cursor-pointer relative">
                <div className="absolute top-4 left-5">
                  <h5 className="text-lg font-normal tracking-tight text-gray-900 dark:text-white">
                    Pegawai Lapangan
                  </h5>
                </div>

                <div className="mt-7 text-left ml-0">
                  <p className="font-bold text-2xl text-black-700 dark:text-gray-400">
                    {absen.filter((item) => item.id_jenis == 5).length}/
                    {karyawan.filter((item) => item.id_jenis === 5).length}
                  </p>
                  <p className="font-normal text-red-700 dark:text-gray-400">
                    Orang
                  </p>
                </div>
                <span className="flex items-center justify-center absolute top-4 right-4 text-blue-700 text-3xl text-center w-8 h-8 rounded-md bg-blue-400">
                  <FaHelmetSafety className="h-6 w-6" />
                </span>
              </Card>
            </div>
            {/* Cleaning Services */}
            <div className="card h-50 w-80">
              <Card href="#" className="cursor-pointer relative">
                <div className="absolute top-4 left-5">
                  <h5 className="text-lg font-normal tracking-tight text-gray-900 dark:text-white">
                    Cleaning Services
                  </h5>
                </div>
                <div className="mt-7 text-left ml-0">
                  <p className="font-bold text-2xl text-black-700 dark:text-gray-400">
                    -/-
                  </p>
                  <p className="font-normal text-red-700 dark:text-gray-400">
                    Orang
                  </p>
                </div>
                <span className="flex items-center justify-center absolute top-4 right-4 text-green-700 text-3xl text-center w-8 h-8 rounded-md bg-green-400">
                  <MdCleaningServices className="h-6 w-6" />
                </span>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Presensi;
