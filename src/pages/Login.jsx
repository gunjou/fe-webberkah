import {React, useState} from 'react'
import { MdOutlineAccountCircle } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { FaEye, FaEyeSlash } from "react-icons/fa";


const Login = () => {
  // Variable show password
  const [password, setPassword] = useState("");
  const [type, setType] = useState('password');
  const [icon, setIcon] = useState(FaEyeSlash);

  // Show Password Function
  const handleToggle = () => {
    if (type==='password'){
       setIcon(FaEye);
       setType('text')
    } else {
       setIcon(FaEyeSlash)
       setType('password')
    }
 }

  return (
    <div className='flex h-screen '>
      <div className="m-auto">
      <div className="w-80 mb-10 h-[24rem] pl-5 pr-5 justify-center border border-white bg-gray-50 rounded drop-shadow-2xl">
          
          {/* Logo */}
          <div className="logo pb-7 pt-5 text-xl">
            <img
              src={process.env.PUBLIC_URL + "images/logo_large.png"}
              className="w-24 m-auto mb-4"
              alt="berkahangsana-logo"
            />
            <h5 className="text-gray-700">Login</h5>
          </div>

          {/* Username Section */}
          <div className="username mb-4">
            <label className="relative block">
              <span className="sr-only">Username</span>
              <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                <MdOutlineAccountCircle className="h-5 w-5 text-gray-700" />
              </span>
              <input
                // onChange={(e) => setUsername(e.target.value)}
                className="placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-blue-600 focus:ring-blue-600 focus:ring-1 sm:text-sm"
                type="text"
                // text={username}
                name="username"
                placeholder="username"
                // value={username}
                // onKeyDown={handleKeyPress}
              />
            </label>
          </div>

          {/* Password Section */}
          <div className="password mb-6">
            <label className="relative block flex">
              <span className="sr-only">Password</span>
              <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                <RiLockPasswordLine className="h-5 w-5 text-gray-700" />
              </span>
              <input
                // onChange={(e) => setPassword(e.target.value)}
                className="placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-blue-600 focus:ring-blue-600 focus:ring-1 sm:text-sm"
                type={type}
                // text={password}
                name="password"
                placeholder="password"
                // value={password}
                // onKeyDown={handleKeyPress}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span class="flex justify-around items-center absolute inset-y-0 right-0 items-center pr-2 pt-1" onClick={handleToggle}>
                <span className="h-5 w-5 text-gray-700">{icon}</span>
              </span>
            </label>
          </div>

            {/* Submit Button */}
            <div className="submit h-10 mb-3 rounded w-full pt-1 text-white bg-blue-600 hover:bg-blue-800 text-md cursor-pointer" >
              <input className="cursor-pointer" type="submit" value="Login" />
            </div>
        </div>
        <span className="text-xs">© 2025, PT. Berkah Angsana</span>
      </div>
    </div>
  )
}

export default Login