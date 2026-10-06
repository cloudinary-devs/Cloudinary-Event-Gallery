import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

const QRCodeGenerator = ({ url }) => {
  const canvasRef = useRef(null);

  const downloadQRCode = () => {
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div>
      <QRCodeCanvas ref={canvasRef} value={url} size={192} marginSize={2} />
      <button onClick={downloadQRCode}>Download QR Code</button>
    </div>
  );
};

export default QRCodeGenerator;
