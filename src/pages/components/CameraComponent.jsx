// CameraComponent.js
import React, { useRef } from 'react';
import Webcam from 'react-webcam';

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
        style={{ transform: 'scaleX(-1)' }} // CSS untuk mirroring
      />
      <button onClick={capture}>Ambil Foto</button>
    </div>
  );
};

export default CameraComponent;