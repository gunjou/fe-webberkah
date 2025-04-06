import React from "react";

const InDevelopMobile = () => {
  return (
    <div className="InDevelopMobile">
      <div className="flex items-center justify-center min-h-[100dvh] bg-gradient-to-b from-custom-merah to-custom-gelap">
        <img
          src={process.env.PUBLIC_URL + "images/pengembangan_mobile.png"}
          alt="Tahap Pengembangan"
          className="h-auto" // opsional, bisa kamu atur ukurannya
        />
      </div>
    </div>
  );
};

export default InDevelopMobile;
