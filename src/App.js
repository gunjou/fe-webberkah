import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import Absensi from './pages/Absensi';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/'>
          <Route index element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pegawai" element={<Dashboard type='profile-pegawai' />} />
          <Route path="/presensi" element={<Dashboard type='presensi' />} />
          <Route path="/rekapan" element={<Dashboard type='rekapan' />} />
          <Route path="/lembur" element={<Dashboard type='lembur' />} />
          <Route path="/perhitungan-gaji" element={<Dashboard type='perhitungan-gaji' />} />
          <Route path="/absensi" element={<Absensi />} />
          <Route path='/404' element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
