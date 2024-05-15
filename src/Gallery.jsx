import { useEffect, useState } from 'react';
import './Gallery.css';
import { getEventIdFromUrl } from './helpers/urlHelpers';
import { getEventData } from './helpers/firebase';
import { AdvancedImage } from '@cloudinary/react';
import {Cloudinary} from "@cloudinary/url-gen";

const Gallery = () => {
  const [showFullImage, setShowFullImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [docSnap, setDocSnap] = useState(null);
  const [loadingStates, setLoadingStates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const cld = new Cloudinary({
    cloud: {
      cloudName: import.meta.env.VITE_CLOUD_NAME
    }
  });

  const eventId = getEventIdFromUrl(window.location.pathname);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docSnap = await getEventData(eventId);
        setDocSnap(docSnap);
        setLoadingStates(new Array(docSnap?.thumbnails?.length || 0).fill(true));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [eventId]);

  const handleThumbnailClick = (imgUrl) => {
    const imageName = imgUrl.substring(imgUrl.lastIndexOf('/') + 1);
    const urlBuilder = `events/${eventId}/${imageName}`;
    setShowFullImage(true);
    setIsLoading(true);
    setSelectedImage(urlBuilder);
  };

  const handleCloseFullImage = () => {
    setShowFullImage(false);
    setSelectedImage(null);
  };

  const handleImageLoad = (index) => {
    setLoadingStates((prevStates) => {
      const newStates = [...prevStates];
      newStates[index] = false;
      return newStates;
    });
  };

  return (
    <div className="gallery">
      <button className="gallery-upload-btn" onClick={() => (window.location.href = `/events/${eventId}`)}>
        Upload Pics
      </button>
      <div className="gallery-container">
        {showFullImage && selectedImage && (
          <div className="full-image-container">
            <button className="close-btn" onClick={handleCloseFullImage}>
              Close
            </button>
            <AdvancedImage cldImg={cld.image(selectedImage).delivery('q_auto').format('auto')} className="full-image" onLoad={()=> setIsLoading(false)}/>
            {isLoading && <p className="loading">Loading...</p>}
          </div>
        )}
        {!showFullImage && docSnap?.thumbnails?.length > 0 ? (
          docSnap?.thumbnails?.map((imgUrl, index) => (
            <div className="image-item" key={index} onClick={() => handleThumbnailClick(imgUrl)}>
              <img src={imgUrl} alt={`Image ${index}`} onLoad={() => handleImageLoad(index)} />
              {loadingStates[index] && <p>Loading...</p>}
            </div>
          ))
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default Gallery;
