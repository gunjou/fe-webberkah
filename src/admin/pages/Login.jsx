import { useState } from "react";
import { MdOutlineAccountCircle } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import api from "../Api";

const Login = () => {
  const [type, setType] = useState("password");
  const [icon, setIcon] = useState(FaEyeSlash);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/login", {
        username,
        password,
      });

      const { access_token, id_karyawan, jenis, nama } = response.data;
      // console.log(response.data);
      localStorage.setItem("token", access_token);
      localStorage.setItem("id_karyawan", id_karyawan);
      localStorage.setItem("jenis", jenis);
      localStorage.setItem("nama", nama);

      navigate("/absensi");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Login gagal. Periksa username dan password."
      );
    }
  };

  const handleToggle = () => {
    if (type === "password") {
      setIcon(FaEye);
      setType("text");
    } else {
      setIcon(FaEyeSlash);
      setType("password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[100dvh] bg-gradient-to-b from-custom-merah to-custom-gelap">
      <div className="bg-gradient-to-t from-custom-cerah to-white rounded-[30px] shadow-lg mx-6 p-10">
        <div className="flex justify-center mb-4">
          <img
            src={process.env.PUBLIC_URL + "images/logo_large.png"}
            className="w-20 h-20 rounded-full bg-white p-2 shadow-lg"
            alt="berkahangsana-logo"
          />
        </div>
        <h2 className="text-center text-2xl font-bold mb-4">
          Login to Your Account
        </h2>
        <form onSubmit={handleLogin}>
          <div className="mb-1">
            <label className="relative block flex">
              <span className="sr-only">Username</span>
              <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                <MdOutlineAccountCircle className="h-5 w-6 text-gray-700" />
              </span>
              <input
                className="placeholder:text-slate-400 mt-1 block w-full border border-gray-300 rounded-[12px] py-2 pl-9 pr-3 shadow-sm p-2 focus:ring focus:ring-blue-500"
                type="text"
                name="username"
                placeholder="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>
          </div>

          <div className="mb-3">
            <label className="relative block flex">
              <span className="sr-only">Password</span>
              <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                <RiLockPasswordLine className="h-5 w-5 text-gray-700" />
              </span>
              <input
                className="placeholder:text-slate-400 mt-1 block w-full border border-gray-300 rounded-[12px] py-2 pl-9 pr-3 shadow-sm p-2 focus:ring focus:ring-blue-500"
                type={type}
                name="password"
                placeholder="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className="flex justify-around items-center absolute inset-y-0 right-0 pr-2 pt-2 cursor-pointer"
                onClick={handleToggle}
              >
                <span className="h-5 w-5 text-gray-700">{icon}</span>
              </span>
            </label>
          </div>

          {error && (
            <div className="text-center text-red-500 text-sm mb-2">{error}</div>
          )}

          <div className="flex justify-center mb-2 pt-3">
            <div className="submit w-[150px] py-2 bg-black text-white font-semibold rounded-[12px] transition duration-300 hover:bg-gray-800 ">
              <input
                className="cursor-pointer w-full h-full"
                type="submit"
                value="Login"
              />
            </div>
          </div>
        </form>
        <div>
          <span className="text-xs text-white">© 2025, PT. Berkah Angsana</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
