/* eslint-disable jsx-a11y/anchor-is-valid */
import { React, useState } from "react";
import { Table, Modal, Label, TextInput } from "flowbite-react";
import { FaTrash, FaUserPlus } from "react-icons/fa";


// import SideMenu from './SideMenu'
// import NavMenu from './NavMenu'

const Pegawai = () => {
	const [openModalAdd, setOpenModalAdd] = useState(false);
	const [openModalEdit, setOpenModalEdit] = useState(false);
  return (
    <div className="Pegawai">
			{/* Navbar Sction */}
			{/* <NavMenu /> */}

			<div className="flex">
			{/* Sidebar Section */}
      	{/* <SideMenu /> */}

				{/* Table List Pegawai */}
				<div className="tabel">
					<div className="text-xl font-bold text-left pl-2 pt-3 pb-3">List Semua Pegawai</div>
					<div className="overflow-x-auto">
						<Table hoverable>
							<Table.Head className="bg-black">
								<Table.HeadCell className="bg-[#FF0404] text-white">Nama Pegawai</Table.HeadCell>
								<Table.HeadCell className="bg-[#FF0404] text-white">Jenis Pegawai</Table.HeadCell>
								<Table.HeadCell className="bg-[#FF0404] text-white">Username</Table.HeadCell>
								<Table.HeadCell className="bg-[#FF0404] text-white">Password</Table.HeadCell>
								<Table.HeadCell className="bg-[#FF0404] text-white">
									<span className="sr-only">Edit</span>
								</Table.HeadCell>
							</Table.Head>
							<Table.Body className="divide-y">
								<Table.Row className="bg-white hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800">
									<Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
										Anisha Stone
									</Table.Cell>
									<Table.Cell>Pegawai Staff</Table.Cell>
									<Table.Cell>anisha</Table.Cell>
									<Table.Cell>N1Ja00</Table.Cell>
									<Table.Cell>
										<span className="font-medium text-cyan-600 hover:underline dark:text-cyan-500 cursor-pointer" onClick={() => setOpenModalEdit(true)}>
											Edit
										</span>
									</Table.Cell>
								</Table.Row>
								<Table.Row className="bg-white hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800">
									<Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
										Justin Callahan
									</Table.Cell>
									<Table.Cell>Pegawai Lapangan</Table.Cell>
									<Table.Cell>justin</Table.Cell>
									<Table.Cell>19Ys6H</Table.Cell>
									<Table.Cell>
										<span className="font-medium text-cyan-600 hover:underline dark:text-cyan-500 cursor-pointer" onClick={() => setOpenModalEdit(true)}>
											Edit
										</span>
									</Table.Cell>
								</Table.Row>
								<Table.Row className="bg-white hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800">
									<Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">Chaya Clayton</Table.Cell>
									<Table.Cell>Pegawai Lapangan</Table.Cell>
									<Table.Cell>chaya</Table.Cell>
									<Table.Cell>AyY708</Table.Cell>
									<Table.Cell>
										<span className="font-medium text-cyan-600 hover:underline dark:text-cyan-500 cursor-pointer" onClick={() => setOpenModalEdit(true)}>
											Edit
										</span>
									</Table.Cell>
								</Table.Row>
							</Table.Body>
						</Table>
					</div>
					{/* End section table */}

					{/* start modal edit data section */}
					<>
						<Modal show={openModalEdit} onClose={() => setOpenModalEdit(false)}>
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
								<TextInput id="small" type="text" sizing="sm"/>
							</div>
							<div>
								<div className="block mb-2">
									<Label htmlFor="small" value="Gaji Pokok" />
								</div>
								<TextInput id="small" type="text" sizing="sm" placeholder="contoh: 1000000"/>
							</div>
							</form>
							</Modal.Body>
							<Modal.Footer>
								<div className="button-footer flex gap-2">
									<button 
										type="button" 
										className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
										onClick={() => setOpenModalEdit(false)}>
											Simpan
									</button>
									<button 
										type="button" 
										class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
										onClick={() => setOpenModalEdit(false)}>
											Batal
									</button>
									<div className="absolute right-5">
										<button 
											type="button" 
											className="flex focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-3 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
											onClick={() => setOpenModalAdd(false)}>
												<span className="text-lg pr-2"><FaTrash /></span>
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
						<button 
							type="button" 
							className="flex mt-5 ml-2 focus:outline-none bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
							onClick={() => setOpenModalAdd(true)}>
								<span className="text-lg pr-2"><FaUserPlus /></span>
								Tambah Pegawai
						</button>
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
								<TextInput id="small" type="text" sizing="sm" placeholder="contoh: 1000000"/>
							</div>
							</form>
							</Modal.Body>
							<Modal.Footer>
								<button 
									type="button" 
									className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
									onClick={() => setOpenModalAdd(false)}>
										Simpan
								</button>
								<button 
									type="button" 
									class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
									onClick={() => setOpenModalAdd(false)}>
										Batal
								</button>
							</Modal.Footer>
						</Modal>
					</>
					{/* end add data section */}
				</div>


			</div>

    </div>
  )
}

export default Pegawai