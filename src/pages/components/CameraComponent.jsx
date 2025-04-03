// CameraComponent.js
import React, { useRef } from "react";
import Webcam from "react-webcam";

const CameraComponent = ({ onCapture, onClose }) => {
  const webcamRef = useRef(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    onCapture(imageSrc); // Panggil fungsi dari props untuk mengirim gambar
    onClose(); // Panggil fungsi untuk menutup kamera
  };

  return (
    <div>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        style={{ transform: "scaleX(-1)" }} // CSS untuk mirroring
      />
      <button
        onClick={capture}
        className="focus:outline-none text-white bg-custom-merah hover:bg-custom-gelap focus:ring-4 focus:ring-green-300 font-medium rounded-full text-base font-semibold px-8 py-2.5 me-2 mb-0.5 mt-4 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
      >
        Ambil Foto
      </button>
    </div>
  );
};

export default CameraComponent;
