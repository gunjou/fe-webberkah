import { React, useState } from 'react'
import { Card } from "flowbite-react";
import { PiOfficeChairBold } from "react-icons/pi";
import { FaHelmetSafety } from "react-icons/fa6";
import { MdCleaningServices } from "react-icons/md";
import { ImCross } from "react-icons/im";

// import NavMenu from './NavMenu'
// import SideMenu from './SideMenu'
import { FaCheck, FaHandHoldingMedical } from 'react-icons/fa';
import ModalHadir from './components/ModalHadir';


const Presensi = () => {
	const [openHadir, setOpenHadir] = useState(false);
  const handleOpenHadir = () => setOpenHadir(true);
  const handleCloseHadir = () => setOpenHadir(false);

  return (
    <div className="Presensi">
			{/* Header */}
			{/* <NavMenu /> */}
			<div className="Body flex">
				{/* <SideMenu /> */}
				{/* Dashboard Presensi */}
				<div>
					<div className="title flex text-2xl pt-4 pl-4 font-bold">Persensi Semua Pegawai</div>
					<div className="Cards grid grid-cols-3 gap-6 m-4"> 
						<div className="card">
							<Card onClick={handleOpenHadir} className="cursor-pointer">
								<div className="flex gap-4">
									<span className="text-[68px] mt-5 text-blue-400"><FaCheck className="" /></span>
									<span className="ml-16">
										<h5 className="text-2xl pb-3 font-bold tracking-tight text-gray-900 dark:text-white">
											Hadir
										</h5>
										<p className="font-normal text-gray-700 dark:text-gray-400 pb-2">
											(orang)
										</p>
										<p className="font-bold text-2xl text-gray-700 dark:text-gray-400 pb-2">
											87/90
										</p>
									</span>
								</div>
							</Card>
							<ModalHadir open={openHadir} close={handleCloseHadir} />
						</div>
						<div className="card">
							<Card href="#" className="">
								<div className="flex gap-4">
									<span className="text-[68px] mt-5 text-green-400"><FaHandHoldingMedical className="" /></span>
									<span className="ml-8">
										<h5 className="text-2xl pb-3 font-bold tracking-tight text-gray-900 dark:text-white">
											Sakit / Izin
										</h5>
										<p className="font-normal text-gray-700 dark:text-gray-400 pb-2">
											(orang)
										</p>
										<p className="font-bold text-2xl text-gray-700 dark:text-gray-400 pb-2">
											10/90
										</p>
									</span>
								</div>
							</Card>
						</div>
						<div className="card">
							<Card href="#" className="">
								<div className="flex gap-4">
									<span className="text-[68px] mt-5 text-red-500"><ImCross className="" /></span>
									<span>
										<h5 className="text-2xl pb-3 font-bold tracking-tight text-gray-900 dark:text-white">
											Tanpa Keterangan
										</h5>
										<p className="font-normal text-gray-700 dark:text-gray-400 pb-2">
											(orang)
										</p>
										<p className="font-bold text-2xl text-gray-700 dark:text-gray-400 pb-2">
											3/90
										</p>
									</span>
								</div>
							</Card>
						</div>
					</div>

					{/* Baris 2 */}
					<div className="title flex text-2xl pt-4 pl-4 font-bold">Persensi Departemen Pegawai</div>
					<div className="Cards grid grid-cols-3 gap-6 m-4"> 
						<div className="card">
							<Card href="#" className="">
								<div className="flex gap-4">
									<span className="text-[68px] mt-5 text-amber-800"><PiOfficeChairBold className="" /></span>
									<span className="ml-7">
										<h5 className="text-2xl pb-3 font-bold tracking-tight text-gray-900 dark:text-white">
											Staf Kantor
										</h5>
										<p className="font-normal text-gray-700 dark:text-gray-400 pb-2">
											Kehadiran (orang)
										</p>
										<p className="font-bold text-2xl text-gray-700 dark:text-gray-400 pb-2">
											30/30
										</p>
									</span>
								</div>
							</Card>
						</div>
						<div className="card">
							<Card href="#" className="">
								<div className="flex gap-4">
									<span className="text-[68px] mt-5 text-amber-500"><FaHelmetSafety className="" /></span>
									<span>
										<h5 className="text-2xl pb-3 font-bold tracking-tight text-gray-900 dark:text-white">
											Pegawai Lapangan
										</h5>
										<p className="font-normal text-gray-700 dark:text-gray-400 pb-2">
											Kehadiran (orang)
										</p>
										<p className="font-bold text-2xl text-gray-700 dark:text-gray-400 pb-2">
											27/30
										</p>
									</span>
								</div>
							</Card>
						</div>
						<div className="card">
							<Card href="#" className="">
								<div className="flex gap-4">
									<span className="text-[68px] mt-5 text-cyan-500"><MdCleaningServices className="" /></span>
									<span>
										<h5 className="text-2xl pb-3 font-bold tracking-tight text-gray-900 dark:text-white">
											Cleaning Service
										</h5>
										<p className="font-normal text-gray-700 dark:text-gray-400 pb-2">
											Kehadiran (orang)
										</p>
										<p className="font-bold text-2xl text-gray-700 dark:text-gray-400 pb-2">
											20/30
										</p>
									</span>
								</div>
							</Card>
						</div>
					</div>
				</div>
				{/* end dashboard presensi */}
			</div>
    </div>
  )
}

export default Presensi