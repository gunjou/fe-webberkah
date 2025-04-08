import React, { useEffect, useState } from "react";
import {
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  Navbar,
} from "flowbite-react";
import Avatar from "@mui/material/Avatar";
import { useNavigate } from "react-router-dom";

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

const NavMenu = () => {
  const navigate = useNavigate();
  const namaAdminRaw = localStorage.getItem("nama") || "Admin";
  const namaAdmin = toTitleCase(namaAdminRaw);

  const [avatarColor, setAvatarColor] = useState("#3F51B5");

  useEffect(() => {
    const savedColor = localStorage.getItem("avatarColor");
    if (savedColor) {
      setAvatarColor(savedColor);
    } else {
      const newColor = getRandomColor();
      localStorage.setItem("avatarColor", newColor);
      setAvatarColor(newColor);
    }
  }, []);

  // Ambil inisial maksimal 2 huruf
  const initials = namaAdminRaw
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

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

            <DropdownItem>Settings</DropdownItem>
            <DropdownDivider />
            <DropdownItem
              onClick={() => {
                if (window.confirm("Apakah anda ingin keluar?")) {
                  localStorage.clear();
                  navigate("/login");
                }
              }}
            >
              Sign out
            </DropdownItem>
          </Dropdown>
          <div className="text-white">
            <div className="text-sm font-bold">{namaAdmin}</div>
            <div className="text-xs">Admin</div>
          </div>
        </div>
      </Navbar>
    </div>
  );
};

export default NavMenu;
