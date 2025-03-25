import React from 'react'
import {
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  Navbar,
  NavbarBrand,
} from "flowbite-react";
import { FaRegUserCircle } from "react-icons/fa";

const NavMenu = () => {
  return (
    <div className="Navbar">
      {/* <Navbar fluid className="bg-[#1AE8C2]"> */}
      <Navbar fluid className="bg-[#FF0404]">
        <NavbarBrand href="#">
          <img src={process.env.PUBLIC_URL + "images/logo_white.png"} className="mr-3 h-7 sm:h-9" alt="Berkah Angsana Logo" />
          <span className="self-center whitespace-nowrap text-xl text-white font-bold dark:text-white">Berkah Angsana</span>
        </NavbarBrand>
        <div className="flex md:order-2">
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <span className="text-2xl text-white"><FaRegUserCircle /></span>
            }
          >
            <DropdownHeader>
              <span className="block text-sm">Admin</span>
              <span className="block truncate text-sm font-medium">admin@berkahangsana.com</span>
            </DropdownHeader>
            <DropdownItem>Profile</DropdownItem>
            <DropdownItem>Settings</DropdownItem>
            <DropdownDivider />
            <DropdownItem>Sign out</DropdownItem>
          </Dropdown>
        </div>
      </Navbar>
    </div>
  )
}

export default NavMenu