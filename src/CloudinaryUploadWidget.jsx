import { useEffect, useState } from "react";
import PropTypes from "prop-types"; // Import PropTypes
import { updateEventData } from "./helpers/firebase";
import { imageOptimization } from "./helpers/cloudinaryHelpers";
import { getEventIdFromUrl } from "./helpers/urlHelpers";
function CloudinaryUploadWidget({ uwConfig, docSnap }) {
  const [loaded, setLoaded] = useState(false);
  const [images, setImages] = useState([]);
  const [thumbnails, setThumbnails] = useState([]);

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

  useEffect(() => {
    if (docSnap && images.length > 0 && thumbnails.length > 0) {
      updateFirestore(docSnap, images, thumbnails);
    }
  }, [docSnap, images, thumbnails]);

  const initializeCloudinaryWidget = async () => {
    if (loaded) {
      window.cloudinary.openUploadWidget(
        uwConfig,
        processUploads
      );
    }
  };

  const updateFirestore = async (docSnap, images, thumbnails) => {
    try {
      let updatedData;
      if (docSnap?.images && docSnap?.thumbnails) {
        updatedData = {
          ...docSnap,
          images: [...docSnap.images, ...images],
          thumbnails: [...docSnap.thumbnails, ...thumbnails],
        };
      } else {
        updatedData = {
          ...docSnap,
          images: [...images],
          thumbnails: [...thumbnails],
        };
      }
      await updateEventData(getEventIdFromUrl(window.location.pathname), updatedData);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const processUploads = (error, result) => {
    if (!error && result && result.event === "success") {
      setImages(prevImages => [
        ...prevImages,
        imageOptimization(result.info.url, "q_auto"),
      ]);
      setThumbnails(prevThumbnails => [
        ...prevThumbnails,
        result.info.thumbnail_url,
      ]);
    }
  };
  
  return (
    <button id="upload_widget" onClick={initializeCloudinaryWidget}>
      Upload Images
    </button>
  );
}

// Define prop types for CloudinaryUploadWidget
CloudinaryUploadWidget.propTypes = {
  uwConfig: PropTypes.object.isRequired, // Prop type object is required
  docSnap: PropTypes.object, // Prop type object is optional
};

export default CloudinaryUploadWidget;
