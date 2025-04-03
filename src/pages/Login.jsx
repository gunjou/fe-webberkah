import { React, useState } from "react";
import { MdOutlineAccountCircle } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Login = () => {
  // Variable show password
  const [password, setPassword] = useState("");
  const [type, setType] = useState("password");
  const [icon, setIcon] = useState(FaEyeSlash);
  const navigate = useNavigate();

  const [role, setRole] = useState(null);

  // Show Password Function
  const handleToggle = () => {
    if (type === "password") {
      setIcon(FaEye);
      setType("text");
    } else {
      setIcon(FaEyeSlash);
      setType("password");
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    // Simulate login logic
    if (username === "admin" && password === "admin") {
      setRole("admin");
      navigate("/dashboard");
      //localStorage.setItem("role", "admin");
    } else if (username === "user" && password === "user") {
      setRole("user");
      navigate("/absensi");
      //localStorage.setItem("role", "user");
    } else {
      alert("Invalid username or password.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-custom-merah to-custom-gelap">
      <div className="bg-gradient-to-t from-custom-cerah to-white rounded-[30px] shadow-lg p-10 max-w-sm w-full">
        <div className="flex justify-center mb-4">
          {/* Logo */}
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
                // onChange={(e) => setUsername(e.target.value)}
                className="placeholder:text-slate-400 mt-1 block w-full border border-gray-300 rounded-[12px] py-2 pl-9 pr-3 shadow-sm p-2 focus:ring focus:ring-blue-500"
                type="text"
                name="username"
                placeholder="username"
                required
                // className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-500"
                // value={username}
                // onKeyDown={handleKeyPress}
              />
            </label>
          </div>

          {/* Password Section */}
          <div className="mb-3">
            <label className="relative block flex">
              <span className="sr-only">Password</span>
              <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                <RiLockPasswordLine className="h-5 w-5 text-gray-700" />
              </span>
              <span className="sr-only">Password</span>

              <input
                // onChange={(e) => setPassword(e.target.value)}
                className="placeholder:text-slate-400 mt-1 block w-full border border-gray-300 rounded-[12px] py-2 pl-9 pr-3 shadow-sm p-2 focus:ring focus:ring-blue-500"
                type={type}
                name="password"
                placeholder="password"
                // value={password}
                // onKeyDown={handleKeyPress}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                //className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-500"
                required
              />
              <span
                class="flex justify-around items-center absolute inset-y-0 right-0 items-center pr-2 pt-2"
                onClick={handleToggle}
              >
                <span className="h-5 w-5 text-gray-700">{icon}</span>
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mb-2">
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
