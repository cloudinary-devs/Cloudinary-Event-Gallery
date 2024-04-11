import { createContext, useEffect, useState } from "react";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "./helpers/firebase";
import { useAuth } from "./AuthContext";
import { imageOptimization } from "./helpers/cloudinaryHelpers";

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

    if (docSnap) {
      setImages(docSnap.images || []);
      setThumbnails(docSnap.thumbnails || []);
    }
  }, [loaded, docSnap]);

  useEffect(() => {
    if (docSnap && images.length > 0 && thumbnails.length > 0) {
      // Perform Firestore operation here
      const updateFirestore = async () => {
        try {
          await setDoc(doc(collection(db, "events"), "lJHuUwje9bNBDsq9aDOeZNrJuz23"), {
            ...docSnap,
            images: images,
            thumbnails: thumbnails,
          });
        } catch (e) {
          console.error("Error adding document: ", e);
          // Handle error gracefully, e.g., show error message to the user
        }
      };
      updateFirestore();
    }
  }, [docSnap, images, thumbnails]);

  const initializeCloudinaryWidget = async () => {
    if (loaded) {
      const myWidget = window.cloudinary.createUploadWidget(
        uwConfig,
        async (error, result) => {
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
        className="cloudinary-button"
        onClick={initializeCloudinaryWidget}
      >
        Upload Images
      </button>
    </CloudinaryScriptContext.Provider>
  );
}

export default CloudinaryUploadWidget;
export { CloudinaryScriptContext };
