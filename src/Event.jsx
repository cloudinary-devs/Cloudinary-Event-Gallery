import "./Event.css";
import { useState } from "react";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { storage } from './helpers/firebase';
import { useAuth } from "./AuthContext";

function Event() {
  const [progressPercent, setProgressPercent] = useState(0);
  const [message, setMessage] = useState("");
  const { docSnap } = useAuth();

  const path = window.location.pathname
    .split("/")
    .filter((segment) => segment !== "")[1];

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");
    const files = e.target.files;
    if (!files) return;

    for (let key in files) {
      if (Object.prototype.hasOwnProperty.call(files, key)) {
        const file = files[key];
        console.log(window.location.pathname);
        const storageRef = ref(
          storage,
          `files/${window.location.pathname}/images/${file.name}`
        );
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setProgressPercent(progress);
          },
          (error) => {
            alert(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then(() => {
              setMessage("Images uploaded correctly");
              setProgressPercent(0);
              e.target.value = "";
            });
          }
        );
      }
    }
  };

  return (
    <div className="event">
      <h2>{docSnap?.eventTitle}</h2>
      <h3>{docSnap?.eventHashtag}</h3>
      <p>Upload pictures of the event</p>
      <form className="form">
        <div>
          <label className="file-input-label">
            Choose Files
            <input
              type="file"
              multiple
              onChange={handleSubmit}
              accept="image/*"
            />
          </label>
        </div>
        {progressPercent > 0 ? (
          <div className="outerbar">
            <div className="innerbar" style={{ width: `${progressPercent}%` }}>
              {progressPercent}%
            </div>
          </div>
        ) : (
          <p>{message}</p>
        )}
      </form>
      <button onClick={() => (window.location.href = `/galleries/${path}`)}>
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
