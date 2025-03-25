import { React, useState } from 'react'
import { RiCalendarScheduleFill } from "react-icons/ri";
import { MdHealthAndSafety } from "react-icons/md";
import { FaStreetView } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import CameraComponent from './components/CameraComponent';

const Absensi = () => {
	const [image, setImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false); // State untuk mengontrol tampilan kamera

  const handleCapture = (imageSrc) => {
    setImage(imageSrc); // Simpan gambar yang diambil ke state
  };

  const handleOpenCamera = () => {
    setShowCamera(true); // Tampilkan kamera
  };

  const handleCloseCamera = () => {
    setShowCamera(false); // Sembunyikan kamera
  };

  return (
    <div className="Absensi">
			{/* Haeder */}
			<div className="Header left-0 m-8">
				<span className="flex text-lg">Hallo,</span>
				<h1 className="flex text-2xl font-semibold">Gugun Jofandi</h1>
			</div>
			{/* End Header */}

			{/* Card Absensi */}
			<div className="mt-5 ml-5 mr-5">
				<div className="block p-5 bg-white border border-gray-200 rounded-xl shadow-lg">
					<div className="grid grid-cols-2 gap-2 pb-6">
						<h2 className='flex text-lg font-semibold'>Jam Kerja</h2>
						<div className=' '>Senin, 10 Mar 2025</div>
					</div>
				<div className="text-4xl font-bold pb-7">08:00 - 17:00</div>
				<div>
      		{/* <h1>Sistem Absensi dengan Pengenalan Wajah</h1> */}
					{!showCamera ? (
						<button 
						type="button" 
						onClick={handleOpenCamera}
						className="focus:outline-none text-white bg-green-500 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-full text-base font-semibold px-8 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">
							Absen Masuk
					</button>
						// <button onClick={handleOpenCamera}>Buka Kamera</button>
					) : (
						<CameraComponent onCapture={handleCapture} onClose={handleCloseCamera} />
					)}
					{image && (
						<div>
							<h2>Gambar yang Diambil:</h2>
							<img src={image} alt="Captured" style={{ transform: 'scaleX(-1)' }} />
						</div>
					)}
				</div>
				{/* <button 
					type="button" 
					className="focus:outline-none text-white bg-green-500 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-full text-base font-semibold px-8 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">
						Absen Masuk
				</button> */}
				</div>
			</div>
			{/* End card abesnsi */}

			{/* Menu Lainnya */}
			<div className="block m-5 bg-white border border-gray-200 rounded-xl shadow-lg">
				<div className="grid grid-cols-7 pt-4 pb-4 place-items-center">
					<div className="col-span-2">
						<div className="text-[27pt] ml-2 text-blue-500"><RiCalendarScheduleFill /></div>
						<p>History</p>
					</div>
					<div className="col-span-2">
						<div className="text-[27pt] ml-3 text-green-600"><MdHealthAndSafety /></div>
						<p>Izin/Sakit</p>
					</div>
					<div className="col-span-3">
						<div className="text-[27pt] ml-8 text-red-600"><FaStreetView /></div>
						<p>Pengajuan Cuti</p>
					</div>
				</div>
			</div>
			{/* End Menu Lainnya */}

			{/* Presensi */}
			<div>
				<span className="Title flex pl-6 text-xl font-semibold">Presensi</span>
				<div className="block ml-5 mr-5 mt-3 bg-white border border-gray-200 rounded-xl shadow-lg">
					<p className="pt-2 pl-3 pb-2 flex font-semibold">Senin, 10 Maret 2025</p>
					<div className="pl-4 grid grid-cols-2">
						<div className="flex pl-2 pb-4">
							<p className="text-xl pt-0.5 pr-2 text-red-700"><FaLocationDot /></p>
							<span className="text-md">PLTG Jeranjang</span>
						</div>
						<span className="text-md font-semibold pl-4">Jam Masuk: 07:55</span>
					</div>
				</div>

				<div className="block ml-5 mr-5 mt-3 bg-white border border-gray-200 rounded-xl shadow-lg">
					<p className="pt-2 pl-3 pb-2 flex font-semibold">Senin, 10 Maret 2025</p>
					<div className="pl-4 grid grid-cols-2">
						<div className="flex pl-2 pb-4">
							<p className="text-xl pt-0.5 pr-2 text-red-700"><FaLocationDot /></p>
							<span className="text-md">PLTG Jeranjang</span>
						</div>
						<span className="text-md font-semibold pl-4">Jam Keluar: 17:05</span>
					</div>
				</div>

			</div>
			{/* End Presensi */}
		</div>
  )
}

export default Absensi