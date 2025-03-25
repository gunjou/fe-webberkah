import React, { useEffect, useState } from 'react';
import axios from 'axios';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  // width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 3,
};

const columns = [
  { field: 'id', headerName: 'No', width: 70, headerAlign: 'center', align: 'center' },
  { field: 'nama', headerName: 'Nama', width: 160 },
  { field: 'jenis', headerName: 'Jenis Karyawan', width: 130 },
  { field: 'tanggal', headerName: 'Tanggal', width: 130, headerAlign: 'center', align: 'center' },
  { field: 'jam_masuk', headerName: 'Waktu Check in', width: 130, headerAlign: 'center', align: 'center' },
  { field: 'jam_keluar', headerName: 'Waktu Check out', width: 130, headerAlign: 'center', align: 'center' },
  { field: 'selisih', headerName: 'Selisih Jam Kerja', width: 180, headerAlign: 'center', align: 'center' },
  // { field: 'status', headerName: 'Selisih Jam Kerja', width: 30, headerAlign: 'center', align: 'center' },
  // {
  //   field: 'fullName',
  //   headerName: 'Full name',
  //   description: 'This column has a value getter and is not sortable.',
  //   sortable: false,
  //   width: 160,
  //   valueGetter: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`,
  // },
];

// const rows = [
//   { id: 1, nama: 'Snow', jenis: 'Jon', tanggal: '17/03/2025', jam_masuk: '08:00', jam_keluar: '17:00', selisih: '8 jam' },
//   { id: 2, nama: 'Lannister', jenis: 'Cersei', tanggal: '17/03/2025', jam_masuk: '08:00', jam_keluar: '17:00', selisih: '8 jam' },
//   { id: 2, nama: 'Lannister', jenis: 'Cersei', tanggal: '17/03/2025', jamMasuk: '08:00', jamKeluar: '17:00', selisih: 8 },
//   { id: 3, nama: 'Lannister', jenis: 'Jaime', tanggal: '17/03/2025', jamMasuk: '08:00', jamKeluar: '17:00', selisih: 8 },
//   { id: 4, nama: 'Stark', jenis: 'Arya', tanggal: '17/03/2025', jamMasuk: '08:00', jamKeluar: '17:00', selisih: 8 },
//   { id: 5, nama: 'Targaryen', jenis: 'Daenerys', tanggal: '17/03/2025', jamMasuk: '08:00', jamKeluar: '17:00', selisih: 8 },
//   { id: 6, nama: 'Melisandre', jenis: null,  tanggal: '17/03/2025', jamMasuk: '08:00', jamKeluar: '17:00', selisih: 8 },
//   { id: 7, nama: 'Clifford', jenis: 'Ferrara', tanggal: '17/03/2025', jamMasuk: '08:00', jamKeluar: '17:00', selisih: 8 },
//   { id: 8, nama: 'Frances', jenis: 'Rossini', tanggal: '17/03/2025', jamMasuk: '08:00', jamKeluar: '17:00', selisih: 8 },
//   { id: 9, nama: 'Roxie', jenis: 'Harvey', tanggal: '17/03/2025', jamMasuk: '08:00', jamKeluar: '17:00', selisih: 8 },
// ];

const paginationModel = { page: 0, pageSize: 50 };


const ModalHadir = ({ open, close }) => {
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await axios.get('http://127.0.0.1:5000/api/absensi');
				setData(response.data);
			} catch (error) {
				setError(error.message);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	if (loading) return null;
	if (error) return null;

	console.log(data)

  return (
    <div className="ModalHadir">
      {/* Modal Semua Pegawai Hadir */}
			<Modal
				open={open}
				onClose={close}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<Box sx={style}>
					<Typography id="modal-modal-title" variant="h6" component="h2" className="pb-2">
						List Pegawai Hadir
					</Typography>
					<Paper sx={{ height: 400, width: '100%' }}>
						<DataGrid
							rows={data}
							columns={columns}
							initialState={{ pagination: { paginationModel } }}
							// pageSizeOptions={[50, 11]}
							// checkboxSelection
							sx={{ border: 0 }}
						/>
					</Paper>
				</Box>
			</Modal>
			{/* End Modal Semua Pegawai Hadir */}
    </div>
  )
}

export default ModalHadir