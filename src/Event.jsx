import "./Event.css";
import { useEffect, useState } from "react";
import CloudinaryUploadWidget from "./CloudinaryUploadWidget";
import { getEventIdFromUrl } from "./helpers/urlHelpers";
import { getEventData } from "./helpers/firebase";

function Event() {
  const uwConfig = {
    cloudName: import.meta.env.VITE_CLOUD_NAME,
    uploadPreset: "react-course",
    sources: ["local"],
    multiple: true,
    folder: `${window.location.pathname}`,
    thumbnailTransformation: {
      width: 500,
      height: 500,
      crop: 'fill'
    },
  };
  const [docSnap, setDocSnap] = useState();
  const urlPath = window.location.pathname;

  useEffect(()=>{
    const fetchData = async() => {
      const eventData = await getEventData(getEventIdFromUrl(urlPath));
      setDocSnap(eventData);
    }
    
    fetchData();
  },[urlPath])

  return (
    <>{docSnap &&
    (
      <div className="event">
        <h2>{docSnap?.eventTitle}</h2>
        <h3>{docSnap?.eventHashtag}</h3>
        <CloudinaryUploadWidget uwConfig={uwConfig} docSnap={docSnap}/>
        <button onClick={() => (window.location.href = `/galleries/${getEventIdFromUrl(urlPath)}`)}>
          View Pictures
        </button>
        <p className="footer">
          Created with 💜 by
          <a href="https://eventographyapp.com/"> Eventography</a>
        </p>
    </div>
    )}
    </>
  );
}
export default Event;
