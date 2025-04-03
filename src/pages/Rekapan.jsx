/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
// import NavMenu from './NavMenu'
// import SideMenu from './SideMenu'
import { Dropdown, DropdownDivider, DropdownItem } from "flowbite-react";
import { IoIosArrowDown } from "react-icons/io";

const Rekapan = () => {
  return (
    <div className="Rekapan">
      {/* <NavMenu /> */}

      <div className="flex">
        {/* <SideMenu /> */}

        {/* component rekapan */}
        <div className="m-4">
          <h1 className="text-2xl font-bold">Rekapan Absensi</h1>
          <div class="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4 dark:bg-gray-900">
            <div className="flex">
              {/* <!-- Dropdown menu --> */}
              <div className="flex md:order-2">
                <Dropdown
                  arrowIcon={false}
                  inline
                  label={
                    <button
                      type="button"
                      className="flex mt-5 ml-2 focus:outline-none bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-3 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                    >
                      Jenis Pegawai
                      <span className="text-lg pl-2 mt-0.5">
                        <IoIosArrowDown />
                      </span>
                    </button>
                  }
                >
                  <DropdownItem>Semua Pegawai</DropdownItem>
                  <DropdownDivider />
                  <DropdownItem>Staf Kantor</DropdownItem>
                  <DropdownItem>Pegawai Lapangan</DropdownItem>
                  <DropdownItem>Cleaning Service</DropdownItem>
                </Dropdown>
              </div>
              {/* <!-- end Dropdown menu --> */}

              {/* Search box */}
              <div className="absolute right-5 mt-5">
                <label for="table-search" class="sr-only">
                  Search
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                    <svg
                      class="w-4 h-4 text-gray-500 dark:text-gray-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 20"
                    >
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="table-search-users"
                    class="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Search for users"
                  />
                </div>
              </div>
              {/* end search box */}
            </div>
            {/* table start */}
            <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead class="text-xs text-black bg-[#000000] text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" class="px-6 py-3">
                    Nama
                  </th>
                  <th scope="col" class="px-6 py-3">
                    Tanggal
                  </th>
                  <th scope="col" class="px-6 py-3">
                    Jam kerja standar
                  </th>
                  <th scope="col" class="px-6 py-3">
                    Jumlah jam kerja
                  </th>
                  <th scope="col" class="px-6 py-3">
                    Selisih jam kerja
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <th
                    scope="row"
                    class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    <div class="">
                      <div class="text-xs font-semibold">Neil Sims</div>
                    </div>
                  </th>
                  <td class="px-6 py-4 text-xs">v</td>
                  <td class="px-6 py-4 text-xs">
                    <div class="flex items-center">3240</div>
                  </td>
                  <td class="px-6 py-4 text-xs">3440</td>
                  <td class="px-6 py-4 text-xs">+200</td>
                </tr>
                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <th
                    scope="row"
                    class="flex items-center px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    <div class="">
                      <div class="text-xs font-semibold">Bonnie Green</div>
                    </div>
                  </th>
                  <td class="px-6 py-4 text-xs">v</td>
                  <td class="px-6 py-4 text-xs">
                    <div class="flex items-center">3240</div>
                  </td>
                  <td class="px-6 py-4 text-xs">3440</td>
                  <td class="px-6 py-4 text-xs">+200</td>
                </tr>
              </tbody>
            </table>
            {/* end table */}
          </div>
        </div>
        {/* End componen rekapan */}
      </div>
    </div>
  );
};

export default Rekapan;
