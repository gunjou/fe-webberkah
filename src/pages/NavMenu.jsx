import React from "react";
import {
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  Navbar,
  NavbarBrand,
} from "flowbite-react";
import { FaRegUserCircle } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";

const NavMenu = () => {
  return (
    <div className="Navbar">
      {/* <Navbar fluid className="bg-[#1AE8C2]"> */}
      <Navbar
        fluid
        className="bg-custom-merah w-full h-[72px] flex items-center justify-between "
      >
        <div className="flex items-center absolute right-0 mr-7 space-x-4 ml-auto">
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white">
            <img
              src={process.env.PUBLIC_URL + "images/icon.ico"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Profile Info */}
          <div className="text-white">
            <div className="text-sm font-bold">Gibran</div>
            <div className="text-xs">Admin</div>
          </div>
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <span className="text-2xl text-white">
                <IoLogOut />
              </span>
            }
          >
            <DropdownHeader>
              <span className="block text-sm">Admin</span>
              <span className="block truncate text-sm font-medium">
                admin@berkahangsana.com
              </span>
            </DropdownHeader>

            <DropdownItem>Settings</DropdownItem>
            <DropdownDivider />
            <DropdownItem>Sign out</DropdownItem>
          </Dropdown>
        </div>
      </Navbar>
    </div>
  );
};

export default NavMenu;
