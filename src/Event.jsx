import "./Event.css";
import { useState } from "react";
import { useAuth } from "./AuthContext";
import CloudinaryUploadWidget from "./CloudinaryUploadWidget";
import { getEventIdFromUrl } from "./helpers/urlHelpers";

function Event() {
  const { docSnap } = useAuth();
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

  return (
    <div className="event">
      <h2>{docSnap?.eventTitle}</h2>
      <h3>#{docSnap?.eventHashtag}</h3>
      <CloudinaryUploadWidget uwConfig={uwConfig} />
      <button onClick={() => (window.location.href = `/galleries/${getEventIdFromUrl()}`)}>
        View Pictures
      </button>
      <p className="footer">
        Created with 💜 by
        <a href="https://eventographyapp.com/"> Eventography</a>
      </p>
    </div>
  );
}
export default Event;
