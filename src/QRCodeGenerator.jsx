import { useRef } from 'react';
import QRCode from 'qrcode.react';
import html2canvas from 'html2canvas';

// eslint-disable-next-line react/prop-types
const QRCodeGenerator = ({ url }) => {
  const qrCodeRef = useRef(null);

  const downloadQRCode = () => {
    if (qrCodeRef.current !== null) {
      html2canvas(qrCodeRef.current)
        .then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = 'qrcode.png';
          link.href = imgData;
          link.click();
        })
        .catch((error) => {
          console.error('Error generating QR code image:', error);
        });
    }
  };

  return (
    <div>
      <div ref={qrCodeRef}>
        <QRCode value={url} />
      </div>
      <button onClick={downloadQRCode}>Download QR Code</button>
    </div>
  );
};

export default QRCodeGenerator;
