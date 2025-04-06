import React from "react";

const InDevelope = () => {
  return (
    <div className="absolute flex items-center justify-center ">
      <img
        src={process.env.PUBLIC_URL + "images/page_in_progress.png"}
        className="max-w-full h-auto mx-auto"
        alt="Page in Progress"
      />
    </div>
  );
};

export default InDevelope;
