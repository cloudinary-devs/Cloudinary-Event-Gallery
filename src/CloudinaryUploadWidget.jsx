import { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { updateEventData } from "./helpers/firebase";
import { getEventIdFromUrl } from "./helpers/urlHelpers";

function CloudinaryUploadWidget({ uwConfig, docSnap }) {
  const [loaded, setLoaded] = useState(false);
  const [images, setImages] = useState([]);
  const [thumbnails, setThumbnails] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(null);

  /**
   * Load Cloudinary Upload Widget Script
   */
  useEffect(() => {
    if (!loaded) {
      const uwScript = document.getElementById("uw");
      if (!uwScript) {
        const script = document.createElement("script");
        script.setAttribute("async", "");
        script.setAttribute("id", "uw");
        script.src = "https://upload-widget.cloudinary.com/global/all.js";
        script.addEventListener("load", () => setLoaded(true));
        document.body.appendChild(script);
      } else {
        setLoaded(true);
      }
    }
  }, [loaded]);

  /**
   * This useEffect will be trigger every time the docSnap, images, or thumbnails chage
   * and will update the data in our Firestore DB
   */
  useEffect(() => {
    const updateEventImages = async () => {
      try {
        const updatedData = {
          ...docSnap,
          images: docSnap?.images ? [...docSnap.images, ...images] : [...images],
          thumbnails: docSnap?.thumbnails ? [...docSnap.thumbnails, ...thumbnails] : [...thumbnails],
        };
        await updateEventData(getEventIdFromUrl(window.location.pathname), updatedData);
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    };

    if (docSnap && images.length > 0 && thumbnails.length > 0) {
      updateEventImages();
    }
  }, [docSnap, images, thumbnails]);

  const initializeCloudinaryWidget = async () => {
    setUploadProgress(null);
    if (loaded) {
      try {
        await window.cloudinary.openUploadWidget(uwConfig, processUploads);
      } catch (error) {
        setUploadProgress('failed');
      }
    }
  };

  const processUploads = useCallback((error, result) => {
    if (result?.event === "queues-end") {
      result.info.files.forEach(img => {
        if (
          img.status !== "success" ||
          img.uploadInfo.moderation?.[0]?.status !== "approved" ||
          error !== undefined
        ) {
          setUploadProgress('failed');
        } else {
          setImages(prevImages => [
            ...prevImages,
            img.uploadInfo.url,
          ]);
          setThumbnails(prevThumbnails => [
            ...prevThumbnails,
            img.uploadInfo.thumbnail_url,
          ]);
          setUploadProgress('successful');
        }
      });
    }
  }, []);

  return (
    <>
      <button id="upload_widget" onClick={initializeCloudinaryWidget}>
        Upload Images
      </button>
      {uploadProgress && (
        <p>Image Upload Status: {uploadProgress === 'successful' ? 'successful' : 'failed'}</p>
      )}
    </>
  );
}

CloudinaryUploadWidget.propTypes = {
  uwConfig: PropTypes.object.isRequired,
  docSnap: PropTypes.object,
};

export default CloudinaryUploadWidget;
