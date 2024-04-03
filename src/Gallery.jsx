import { useEffect, useState } from 'react';
import './Gallery.css';
import { ref, getDownloadURL, listAll } from "firebase/storage";
import { getLastPartOfUrl } from './helpers/urlHelpers';
import { storage } from './helpers/firebase';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [showFullImage, setShowFullImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [path, setPath] = useState(null);
  
  useEffect(()=> {
    const fetchImages = async () => {
        try {
            const files = [];
            setPath(window.location.pathname.split('/').filter(segment => segment !== '')[1]); 
            const listRef = ref(storage, `files/events/${path}/images/thumbs`);
            const {items} = await listAll(listRef);
            for (const itemRef of items) {
                const downloadURL = await getDownloadURL(itemRef);
                files.push(
                        {
                            imgName: itemRef.name,
                            imgUrl: downloadURL
                        }
                    );
            }
            setImages(files);
        } catch (error) {
          console.error(error);
        }
      };
      fetchImages();
  }, [path]);

  const handleThumbnailClick = async(imgName) => {
    try {
        const imgRef = ref(storage, `files/events/${path}/${imageClenupName(imgName)}`);
        const downloadURL = await getDownloadURL(imgRef);
        setShowFullImage(true);
        setSelectedImage(downloadURL);
    } catch(error) {
        console.error(error)
    }
  };

  const imageClenupName = (imgName) => {
    const sizeIndex = imgName.lastIndexOf('_200x200');
    if (sizeIndex !== -1) {
        const start = imgName.slice(0, sizeIndex);
        const end = imgName.slice(sizeIndex + '_200x200'.length);
        return start + end;
    }
    return imgName;
  }

  const handleCloseFullImage = () => {
    setShowFullImage(false);
    setSelectedImage(null);
  };

  return (
    <>
      <button className="gallery-upload-btn" onClick={() => window.location.href = `/events/${getLastPartOfUrl()}`}>Upload Pics</button>
      <div className="gallery-container">
        {showFullImage && selectedImage && (
          <div className="full-image-container">
            <button className="close-btn" onClick={handleCloseFullImage}>Close</button>
            <img src={selectedImage} alt="Full Size" className="full-image" />
          </div>
        )}
        {!showFullImage && images.length > 0 ? (
          images.map(({imgName, imgUrl}, index) => (
            <div className="image-item" key={index} onClick={() => handleThumbnailClick(imgName)}>
              <img src={imgUrl} alt={`Image ${index}`} />
            </div>
          ))
        ) : <p>Loading...</p>}
      </div>
    </>
  );
};

export default Gallery;
