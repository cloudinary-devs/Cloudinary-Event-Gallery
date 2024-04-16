import { useState, useEffect } from "react";
import "./Profile.css";
import { db } from "./helpers/firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import QRCodeGenerator from "./QRCodeGenerator";
import { useAuth } from "./AuthContext";

const Profile = () => {
  const { user, docSnap, setUser, signInWithGoogle } = useAuth();
  const [eventData, setEventData] = useState({
    eventTitle: "",
    eventHashtag: "",
  });
  const link = window.location.hostname;

  useEffect(() => {
    if (docSnap) {
      setEventData({
        eventTitle: docSnap?.eventTitle || "",
        eventHashtag: docSnap?.eventHashtag || "",
      });
    } else if (!user) {
      setUser(null);
    }
  }, [docSnap, user, setUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      await setDoc(doc(collection(db, "events"), user?.uid), {
        eventLink: `${link}/events/${user?.uid}`,
        email: user.email,
        ...eventData,
        uid: user.uid,
      });
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const copyEventLink = () => {
    navigator.clipboard.writeText(`https://${link}/events/${user?.uid}`);
  };

  return (
    <div className="profile">
        {user ? (
        <div className="profile-container">
          <div>
            <label htmlFor="eventTitle">Event Title:</label>
            <input
              type="text"
              id="eventTitle"
              name="eventTitle"
              value={eventData.eventTitle}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="eventHashtag">Event Hashtag:</label>
            <input
              type="text"
              id="eventHashtag"
              name="eventHashtag"
              value={eventData.eventHashtag}
              onChange={handleInputChange}
            />
          </div>
          <button className="save" onClick={handleSave}>
            Save
          </button>
          <div className="buttons">
            <button onClick={copyEventLink}>Copy Event Link</button>
            <button onClick={() => (window.location.href = `/events/${user?.uid}`)}>
              Go To Event
            </button>
          </div>
          <QRCodeGenerator url={`https://${link}/events/${user?.uid}`} />
        </div>) : 
        <button onClick={signInWithGoogle}>Login</button>
      }
    </div>
  );
};

export default Profile;
