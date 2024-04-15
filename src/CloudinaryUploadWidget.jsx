import { createContext, useEffect, useState } from "react";
import { updateEventData } from "./helpers/firebase";
import { useAuth } from "./AuthContext";
import { imageOptimization } from "./helpers/cloudinaryHelpers";
import { getEventIdFromUrl } from "./helpers/urlHelpers";

// Create a context to manage the script loading state
const CloudinaryScriptContext = createContext();

function CloudinaryUploadWidget({ uwConfig }) {
  const [loaded, setLoaded] = useState(false);
  const [images, setImages] = useState([]);
  const [thumbnails, setThumbnails] = useState([]);
  const { docSnap } = useAuth();

  useEffect(() => {
    // Check if the script is already loaded
    if (!loaded) {
      const uwScript = document.getElementById("uw");
      if (!uwScript) {
        // If not loaded, create and load the script
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
      const updateFirestore = async () => {
        try {
          await updateEventData(getEventIdFromUrl(), {
            ...docSnap,
            images: images,
            thumbnails: thumbnails,
          });
        } catch (e) {
          console.error("Error adding document: ", e);
        }
      };
      updateFirestore();
    }
  }, [docSnap, images, thumbnails]);

  const initializeCloudinaryWidget = async () => {
    if (loaded) {
      const myWidget = window.cloudinary.createUploadWidget(
        uwConfig,
        (error, result) => {
          if (!error && result && result.event === "success") {
            setImages(prevImages => [...prevImages, imageOptimization(result.info.url, 'q_auto')]);
            setThumbnails(prevThumbnails => [...prevThumbnails, result.info.thumbnail_url]);
          }
        }
      );

      document.getElementById("upload_widget").addEventListener(
        "click",
        () => {
          myWidget.open();
        },
        false
      );
    }
  };

  return (
    <CloudinaryScriptContext.Provider value={{ loaded }}>
      <button
        id="upload_widget"
        onClick={initializeCloudinaryWidget}
      >
        Upload Images
      </button>
    </CloudinaryScriptContext.Provider>
  );
}

export default CloudinaryUploadWidget;
export { CloudinaryScriptContext };
