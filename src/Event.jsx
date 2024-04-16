import "./Event.css";
import { useEffect, useState } from "react";
import CloudinaryUploadWidget from "./CloudinaryUploadWidget";
import { getEventIdFromUrl } from "./helpers/urlHelpers";
import { getEventData } from "./helpers/firebase";

function Event() {
  const [cloudName] = useState("eventography");
  const [uploadPreset] = useState("react-course");
  const [uwConfig] = useState({
    cloudName,
    uploadPreset,
    sources: ["local"],
    multiple: true,
    folder: `${window.location.pathname}`,
    thumbnailTransformation: {
      width: 500,
      height: 500,
      crop: 'fill'
    }
  });
  const [docSnap, setDocSnap] = useState();

  useEffect(()=>{
    const fetchData = async() => {
      const eventData = await getEventData(getEventIdFromUrl());
      setDocSnap(eventData);
    }
    
    fetchData();
  },[])

  return (
    <>{docSnap &&
    (
      <div className="event">
      <h2>{docSnap?.eventTitle}</h2>
      <h3>{docSnap?.eventHashtag}</h3>
      <CloudinaryUploadWidget uwConfig={uwConfig} docSnap={docSnap}/>
      <button onClick={() => (window.location.href = `/galleries/${getEventIdFromUrl()}`)}>
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
