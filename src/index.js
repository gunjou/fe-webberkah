import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App"; // fallback atau default
import AdminApp from "./admin.js";
import AbsenApp from "./absen.js";

// Ambil subdomain dari URL
const hostname = window.location.hostname;
let RootComponent = App;

if (hostname.startsWith("admin")) {
  RootComponent = AdminApp;
} else if (hostname.startsWith("absen")) {
  RootComponent = AbsenApp;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RootComponent />);

// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import './index.css';
// import App from './App';

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );
