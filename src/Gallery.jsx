import { useEffect, useState } from 'react';
import './Gallery.css';
import { getLastPartOfUrl } from './helpers/urlHelpers';
import { getEventData } from './helpers/firebase';

const Gallery = () => {
  const [showFullImage, setShowFullImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [docSnap, setDocSnap] = useState(null);
  const [loadingStates, setLoadingStates] = useState([]);
  const eventId = getLastPartOfUrl();
  useEffect(() => {
    const fetchData = async () => {
      const docSnap = await getEventData(eventId);
      setDocSnap(docSnap);
      setLoadingStates(new Array(docSnap?.thumbnails?.length || 0).fill(true));
    };
    fetchData();  
  }, [eventId]);

  const handleThumbnailClick = (imgUrl) => {
    const imageName = imgUrl.substring(imgUrl.lastIndexOf('/') + 1);
    const imageUrlPath = import.meta.env.VITE_CLOUDINARY_CLOUD_FOLDER_URL;
    const urlBuilder = `${imageUrlPath}${eventId}/${imageName}`;
    setShowFullImage(true);
    setSelectedImage(urlBuilder);
  };

  const handleCloseFullImage = () => {
    setShowFullImage(false);
    setSelectedImage(null);
  };

  const handleImageLoad = (index) => {
    setLoadingStates(prevStates => {
      const newStates = [...prevStates];
      newStates[index] = false;
      return newStates;
    });
  };

  return (
    <>
      <button className="gallery-upload-btn" onClick={() => window.location.href = `/events/${eventId}`}>Upload Pics</button>
      <div className="gallery-container">
        {showFullImage && selectedImage && (
          <div className="full-image-container">
            <button className="close-btn" onClick={handleCloseFullImage}>Close</button>
            <img src={selectedImage} alt="Full Size" className="full-image" />
          </div>
        )}
        {!showFullImage && docSnap?.thumbnails?.length > 0 ? (
          docSnap?.thumbnails?.map((imgUrl, index) => (
            <div className="image-item" key={index} onClick={() => handleThumbnailClick(imgUrl)}>
              <img
                src={imgUrl}
                alt={`Image ${index}`}
                onLoad={() => handleImageLoad(index)}
              />
              {loadingStates[index] && <p>Loading...</p>}
            </div>
          ))
        ) : <p>Loading...</p>}
      </div>
    </>
  );
}

export default Gallery;
