import React, { useEffect, useState, useRef } from "react";
import {
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  Navbar,
  Modal,
  Button,
  Spinner,
} from "flowbite-react";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import { useNavigate } from "react-router-dom";
import { SiGmail } from "react-icons/si";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import { IoMdNotificationsOutline } from "react-icons/io";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import api from "../../shared/Api";

// Warna acak
const getRandomColor = () => {
  const colors = [
    "#F44336",
    "#E91E63",
    "#9C27B0",
    "#3F51B5",
    "#2196F3",
    "#009688",
    "#4CAF50",
    "#FF9800",
    "#795548",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Title case converter
const toTitleCase = (str) =>
  str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

// Tambahkan fungsi untuk filter hanya data pending
const getPendingIzin = (list) =>
  list.filter((item) => item.status_izin?.toLowerCase() === "pending");
const getPendingLembur = (list) =>
  list.filter((item) => item.status_lembur?.toLowerCase() === "pending");

const NavMenu = () => {
  const navigate = useNavigate();
  const namaAdminRaw = localStorage.getItem("nama") || "Admin";
  const namaAdmin = toTitleCase(namaAdminRaw);

  const [avatarColor, setAvatarColor] = useState("#3F51B5");
  const [openModal, setOpenModal] = useState(false); // Modal Tentang
  const [notifModal, setNotifModal] = useState(false); // Modal Notifikasi
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifList, setNotifList] = useState([]);
  const [notifError, setNotifError] = useState("");
  const [notifCount, setNotifCount] = useState(0);
  const [notifPesan, setNotifPesan] = useState([]); // untuk data notifikasi admin
  const [rejectId, setRejectId] = useState(null);
  const [alasanPenolakan, setAlasanPenolakan] = useState("");
  const alasanInputRef = useRef(null);
  const [filterTanggal, setFilterTanggal] = useState(null);
  const [filterJenis, setFilterJenis] = useState("all"); // all | izin | lembur
  const [lemburList, setLemburList] = useState([]);
  const [lemburLoading, setLemburLoading] = useState(false);
  const [lemburError, setLemburError] = useState("");
  const [rejectLemburId, setRejectLemburId] = useState(null);
  const [alasanRejectLembur, setAlasanRejectLembur] = useState("");
  const alasanLemburInputRef = useRef(null);

  useEffect(() => {
    const savedColor = localStorage.getItem("avatarColor");
    if (savedColor) {
      setAvatarColor(savedColor);
    } else {
      const newColor = getRandomColor();
      localStorage.setItem("avatarColor", newColor);
      setAvatarColor(newColor);
    }
    fetchNotif(); // panggil fetchNotif saat komponen dimuat
    fetchNotifCount(); // panggil juga fetchNotifCount saat komponen dimuat
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/logout/admin");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.clear();
      window.location.replace("/login"); // kembali ke halaman login
    }
  };

  // Ambil inisial maksimal 2 huruf
  const initials = namaAdminRaw
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // Fetch notifikasi izin/sakit
  const fetchNotif = async (tanggal = null) => {
    setNotifLoading(true);
    setNotifError("");
    try {
      const token = localStorage.getItem("token");
      let url = `/izin/list`;
      if (tanggal) {
        url += `?tanggal=${tanggal}`;
      }
      const res = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifList(res.data.data || []);
      //setNotifCount(res.data.count || 0);
    } catch (err) {
      setNotifError("Gagal memuat notifikasi.");
      setNotifList([]);
      //setNotifCount(0);
    } finally {
      setNotifLoading(false);
    }
  };

  // Fetch lembur list
  const fetchLembur = async (tanggal = null) => {
    setLemburLoading(true);
    setLemburError("");
    try {
      const token = localStorage.getItem("token");
      let url = `/lembur/list`;
      if (tanggal) {
        url += `?tanggal=${tanggal}`;
      }
      const res = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLemburList(res.data.data || []);
    } catch (err) {
      setLemburError("Gagal memuat data lembur.");
      setLemburList([]);
    } finally {
      setLemburLoading(false);
    }
  };

  // Ambil count notifikasi admin
  const fetchNotifCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/notifikasi?role=admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifCount(res.data.count || 0);
      setNotifPesan(res.data.data || []);
    } catch (err) {
      setNotifCount(0);
      setNotifPesan([]);
    }
  };

  // Tandai notif sudah dibaca
  const markNotifAsRead = async (id_notifikasi) => {
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/notifikasi/${id_notifikasi}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchNotifCount(); // refresh count setelah dibaca
    } catch (err) {
      // Optional: handle error
    }
  };

  useEffect(() => {
    if (notifModal) {
      if (filterTanggal) {
        fetchNotif(filterTanggal.format("YYYY-MM-DD"));
        fetchLembur(filterTanggal.format("YYYY-MM-DD"));
      } else {
        fetchNotif();
        fetchLembur();
      }
    }
    // eslint-disable-next-line
  }, [notifModal, filterTanggal]);

  const handleApprove = async (id_izin) => {
    try {
      const token = localStorage.getItem("token");
      await api.post(
        `/izin/${id_izin}/approve`,
        {},
        {
          "Content-Type": undefined,
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchNotif();
      alert("Izin berhasil di-approve.");
    } catch (err) {
      alert("Gagal approve izin.");
    }
  };

  const handleReject = async (id_izin) => {
    setRejectId(id_izin);
    setTimeout(() => {
      if (alasanInputRef.current) alasanInputRef.current.focus();
    }, 100);
  };

  const submitReject = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.post(
        `/izin/${rejectId}/reject`,
        { alasan_penolakan: alasanPenolakan },
        {
          "Content-Type": undefined,
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRejectId(null);
      setAlasanPenolakan("");
      fetchNotif();
      alert("Izin berhasil di-reject.");
    } catch (err) {
      alert("Gagal reject izin.");
    }
  };

  const handleApproveLembur = async (id_lembur) => {
    try {
      const token = localStorage.getItem("token");
      await api.post(
        `/lembur/${id_lembur}/approve`,
        {},
        {
          "Content-Type": undefined,
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchLembur(filterTanggal ? filterTanggal.format("YYYY-MM-DD") : null);
      alert("Lembur berhasil di-approve.");
    } catch (err) {
      alert("Gagal approve lembur.");
    }
  };

  const handleRejectLembur = (id_lembur) => {
    setRejectLemburId(id_lembur);
    setTimeout(() => {
      if (alasanLemburInputRef.current) alasanLemburInputRef.current.focus();
    }, 100);
  };

  const submitRejectLembur = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.post(
        `/lembur/${rejectLemburId}/reject`,
        { alasan_penolakan: alasanRejectLembur },
        {
          "Content-Type": undefined,
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRejectLemburId(null);
      setAlasanRejectLembur("");
      fetchLembur(filterTanggal ? filterTanggal.format("YYYY-MM-DD") : null);
      alert("Lembur berhasil di-reject.");
    } catch (err) {
      alert("Gagal reject lembur.");
    }
  };

  // Buka modal notifikasi dan fetch data
  const openNotifModal = () => {
    setNotifModal(true);
    fetchNotif();
    fetchNotifCount();
    // Tandai notif admin sebagai sudah dibaca jika ada yang belum dibaca
    const unread = notifPesan.find((item) => !item.dibaca);
    if (unread) {
      markNotifAsRead(unread.id_notifikasi);
    }
  };

  // Hitung jumlah data pending untuk badge
  const badgeCount =
    getPendingIzin(notifList).length + getPendingLembur(lemburList).length;

  return (
    <div className="Navbar">
      <Navbar
        fluid
        className="bg-custom-merah w-full h-[72px] flex items-center justify-between"
      >
        <div className="flex items-center absolute right-0 mr-7 space-x-4 ml-auto">
          <Dropdown
            arrowIcon={false}
            inline
            className="min-w-fit max-w-xs"
            label={
              <Avatar sx={{ bgcolor: avatarColor, width: 40, height: 40 }}>
                {initials}
              </Avatar>
            }
          >
            <DropdownHeader>
              <span className="text-sm whitespace-nowrap">{namaAdmin}</span>
            </DropdownHeader>

            <DropdownItem onClick={() => setOpenModal(true)}>
              Tentang
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem
              onClick={() => {
                if (window.confirm("Apakah anda ingin keluar?")) {
                  handleLogout();
                }
              }}
            >
              Logout
            </DropdownItem>
          </Dropdown>
          <div className="text-white">
            <div className="text-sm font-bold">{namaAdmin}</div>
            <div className="text-xs">Admin</div>
          </div>
          {/* <Badge
            badgeContent={badgeCount}
            color="error"
            overlap="circular"
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <IoMdNotificationsOutline
              size={28}
              className="text-white cursor-pointer hover:text-yellow-400 transition"
              title="Notifikasi"
              onClick={openNotifModal}
            />
          </Badge> */}
        </div>
      </Navbar>

      {/* Modal Notifikasi Izin/Sakit & Lembur */}
      <Modal show={notifModal} onClose={() => setNotifModal(false)}>
        <Modal.Header>
          Permintaan Izin, Sakit & Lembur
          <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
            {badgeCount}
          </span>
        </Modal.Header>
        <Modal.Body>
          {/* Dropdown filter jenis */}
          <div className="flex items-center gap-2 pb-4">
            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="all">Semua</option>
              <option value="izin">Izin/Sakit</option>
              <option value="lembur">Lembur</option>
            </select>
          </div>
          {/* --- IZIN/SAKIT --- */}
          {(filterJenis === "all" || filterJenis === "izin") && (
            <div className="mb-6">
              <h3 className="font-bold mb-2">Permintaan Izin/Sakit</h3>
              {notifLoading ? (
                <div className="flex justify-center py-4">
                  <Spinner size="lg" />
                </div>
              ) : notifError ? (
                <div className="text-red-500 text-center">{notifError}</div>
              ) : getPendingIzin(notifList).length === 0 ? (
                <div className="text-gray-500 text-center py-4">
                  Tidak ada permintaan izin/sakit.
                </div>
              ) : (
                <div className="space-y-4">
                  {getPendingIzin(notifList).map((item) => {
                    // Hitung jumlah hari izin
                    let jumlahHari = "-";
                    if (item.tgl_mulai && item.tgl_selesai) {
                      const start = dayjs(item.tgl_mulai);
                      const end = dayjs(item.tgl_selesai);
                      jumlahHari = end.diff(start, "day") + 1;
                      if (jumlahHari < 1) jumlahHari = 1;
                    }
                    return (
                      <div
                        key={item.id_izin}
                        className="border rounded-lg p-4 bg-gray-50 shadow-sm text-left"
                      >
                        <div className="mb-1 flex">
                          <span className="font-semibold w-36 inline-block">
                            Nama
                          </span>
                          <span className="mr-2">:</span>
                          <span>
                            {item.nama
                              ? item.nama.replace(/\b\w/g, (c) =>
                                  c.toUpperCase()
                                )
                              : ""}
                          </span>
                        </div>
                        <div className="mb-1 flex">
                          <span className="font-semibold w-36 inline-block">
                            Jenis
                          </span>
                          <span className="mr-2">:</span>
                          <span>{item.nama_status}</span>
                        </div>
                        <div className="mb-1 flex">
                          <span className="font-semibold w-36 inline-block">
                            Tanggal Mulai
                          </span>
                          <span className="mr-2">:</span>
                          <span>
                            {item.tgl_mulai
                              ? dayjs(item.tgl_mulai).format("DD/MM/YYYY")
                              : "-"}
                          </span>
                        </div>
                        <div className="mb-1 flex">
                          <span className="font-semibold w-36 inline-block">
                            Tanggal Selesai
                          </span>
                          <span className="mr-2">:</span>
                          <span>
                            {item.tgl_selesai
                              ? dayjs(item.tgl_selesai).format("DD/MM/YYYY")
                              : "-"}
                          </span>
                        </div>
                        <div className="mb-1 flex">
                          <span className="font-semibold w-36 inline-block">
                            Durasi Izin
                          </span>
                          <span className="mr-2">:</span>
                          <span>{jumlahHari} hari</span>
                        </div>
                        <div className="mb-1 flex">
                          <span className="font-semibold w-36 inline-block">
                            Alasan
                          </span>
                          <span className="mr-2">:</span>
                          <span>{item.keterangan}</span>
                        </div>
                        <div className="mb-2 flex">
                          <span className="font-semibold w-36 inline-block">
                            Status
                          </span>
                          <span className="mr-2">:</span>
                          <span
                            className={
                              item.status_izin?.toLowerCase() === "approved"
                                ? "font-bold text-green-600"
                                : item.status_izin?.toLowerCase() === "pending"
                                ? "font-bold text-yellow-500"
                                : item.status_izin?.toLowerCase() === "rejected"
                                ? "font-bold text-red-600"
                                : "font-bold text-gray-600"
                            }
                          >
                            {item.status_izin
                              ? item.status_izin.replace(/\b\w/g, (c) =>
                                  c.toUpperCase()
                                )
                              : ""}
                          </span>
                        </div>
                        {/* Tombol Approve dan Reject */}
                        <div className="flex gap-2 mt-2">
                          <Button
                            color="success"
                            size="xs"
                            onClick={() => handleApprove(item.id_izin)}
                          >
                            Approve
                          </Button>
                          <Button
                            color="failure"
                            size="xs"
                            onClick={() => handleReject(item.id_izin)}
                          >
                            Reject
                          </Button>
                        </div>
                        {/* Input alasan penolakan muncul hanya untuk item yang sedang direject */}
                        {rejectId === item.id_izin && (
                          <div className="mt-3 flex flex-col gap-2">
                            <input
                              ref={alasanInputRef}
                              type="text"
                              className="border rounded px-2 py-1 text-sm"
                              placeholder="Alasan penolakan"
                              value={alasanPenolakan}
                              onChange={(e) =>
                                setAlasanPenolakan(e.target.value)
                              }
                            />
                            <div className="flex gap-2">
                              <Button
                                color="failure"
                                size="xs"
                                onClick={submitReject}
                                disabled={!alasanPenolakan.trim()}
                              >
                                Kirim Penolakan
                              </Button>
                              <Button
                                color="gray"
                                size="xs"
                                onClick={() => {
                                  setRejectId(null);
                                  setAlasanPenolakan("");
                                }}
                              >
                                Batal
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          {/* --- LEMBUR --- */}
          {(filterJenis === "all" || filterJenis === "lembur") && (
            <div>
              <h3 className="font-bold mb-2">Permintaan Lembur</h3>
              {lemburLoading ? (
                <div className="flex justify-center py-4">
                  <Spinner size="lg" />
                </div>
              ) : lemburError ? (
                <div className="text-red-500 text-center">{lemburError}</div>
              ) : getPendingLembur(lemburList).length === 0 ? (
                <div className="text-gray-500 text-center py-4">
                  Tidak ada permintaan lembur.
                </div>
              ) : (
                <div className="space-y-4">
                  {getPendingLembur(lemburList).map((item) => (
                    <div
                      key={item.id_lembur}
                      className="border rounded-lg p-4 bg-gray-50 shadow-sm text-left"
                    >
                      <div className="mb-1 flex">
                        <span className="font-semibold w-36 inline-block">
                          Nama
                        </span>
                        <span className="mr-2">:</span>
                        <span>
                          {item.nama
                            ? item.nama.replace(/\b\w/g, (c) => c.toUpperCase())
                            : ""}
                        </span>
                      </div>
                      <div className="mb-1 flex">
                        <span className="font-semibold w-36 inline-block">
                          Tanggal
                        </span>
                        <span className="mr-2">:</span>
                        <span>
                          {item.tanggal
                            ? dayjs(item.tanggal).format("DD/MM/YYYY")
                            : "-"}
                        </span>
                      </div>
                      <div className="mb-1 flex">
                        <span className="font-semibold w-36 inline-block">
                          Jam Mulai
                        </span>
                        <span className="mr-2">:</span>
                        <span>{item.jam_mulai || "-"}</span>
                      </div>
                      <div className="mb-1 flex">
                        <span className="font-semibold w-36 inline-block">
                          Jam Selesai
                        </span>
                        <span className="mr-2">:</span>
                        <span>{item.jam_selesai || "-"}</span>
                      </div>
                      <div className="mb-1 flex">
                        <span className="font-semibold w-36 inline-block">
                          Deskripsi
                        </span>
                        <span className="mr-2">:</span>
                        <span>{item.deskripsi || "-"}</span>
                      </div>
                      <div className="mb-1 flex">
                        <span className="font-semibold w-36 inline-block">
                          Lampiran
                        </span>
                        <span className="mr-2">:</span>
                        {item.lampiran ? (
                          <a
                            href={item.lampiran}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            Lihat
                          </a>
                        ) : (
                          <span>-</span>
                        )}
                      </div>
                      <div className="mb-2 flex">
                        <span className="font-semibold w-36 inline-block">
                          Status
                        </span>
                        <span className="mr-2">:</span>
                        <span
                          className={
                            item.status_lembur?.toLowerCase() === "approved"
                              ? "font-bold text-green-600"
                              : item.status_lembur?.toLowerCase() === "pending"
                              ? "font-bold text-yellow-500"
                              : item.status_lembur?.toLowerCase() === "rejected"
                              ? "font-bold text-red-600"
                              : "font-bold text-gray-600"
                          }
                        >
                          {item.status_lembur
                            ? item.status_lembur.replace(/\b\w/g, (c) =>
                                c.toUpperCase()
                              )
                            : ""}
                        </span>
                      </div>
                      {/* Tombol Approve dan Reject untuk lembur */}
                      <div className="flex gap-2 mt-2">
                        <Button
                          color="success"
                          size="xs"
                          onClick={() => handleApproveLembur(item.id_lembur)}
                        >
                          Approve
                        </Button>
                        <Button
                          color="failure"
                          size="xs"
                          onClick={() => handleRejectLembur(item.id_lembur)}
                        >
                          Reject
                        </Button>
                      </div>
                      {/* Input alasan penolakan muncul hanya untuk item yang sedang direject */}
                      {rejectLemburId === item.id_lembur && (
                        <div className="mt-3 flex flex-col gap-2">
                          <input
                            ref={alasanLemburInputRef}
                            type="text"
                            className="border rounded px-2 py-1 text-sm"
                            placeholder="Alasan penolakan"
                            value={alasanRejectLembur}
                            onChange={(e) =>
                              setAlasanRejectLembur(e.target.value)
                            }
                          />
                          <div className="flex gap-2">
                            <Button
                              color="failure"
                              size="xs"
                              onClick={submitRejectLembur}
                              disabled={!alasanRejectLembur.trim()}
                            >
                              Kirim Penolakan
                            </Button>
                            <Button
                              color="gray"
                              size="xs"
                              onClick={() => {
                                setRejectLemburId(null);
                                setAlasanRejectLembur("");
                              }}
                            >
                              Batal
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setNotifModal(false)}>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Modal Tentang */}
      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <Modal.Header>Tentang Aplikasi</Modal.Header>
        <Modal.Body>
          <div className="space-y-2 text-sm">
            <div>
              <b>Berkah Angsana (Admin) </b>
            </div>
            <div>
              Sistem manajemen absensi dan pegawai PT. Berkah Angsana Teknik.
            </div>
            <div className="flex items-center gap-1">
              Supported by:
              <img
                src={"images/icon-outlook.svg"}
                alt="Outlook"
                style={{
                  width: 16,
                  height: 16,
                  display: "inline-block",
                  marginLeft: 4,
                }}
              />
              OutLook Project
            </div>
            <div className="flex space-x-2 mt-2 text-[10px] justify-left">
              <a
                href="https://wa.me/6281917250391"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green-500"
              >
                <FaWhatsapp size={20} />
              </a>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=gibrangl1167@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-red-400"
              >
                <SiGmail size={20} />
              </a>
              <a
                href="https://www.instagram.com/outlookofficial_/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-500"
              >
                <FaInstagram size={20} />
              </a>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setOpenModal(false)}>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default NavMenu;
