const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", flowbite.content()],
  theme: {
    extend: {
      colors: {
        "custom-gelap": "#2C2129",
        "custom-merah": "#7c161b",
        "custom-cerah": "#B77171",
      },
    },
  },
  plugins: [flowbite.plugin()],
};
