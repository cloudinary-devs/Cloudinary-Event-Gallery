import { useState } from "react";
import "./Profile.css"; // Import the CSS file
import { db } from "./helpers/firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import QRCodeGenerator from "./QRCodeGenerator";
import { useAuth } from "./AuthContext";
import { useEffect } from "react";

const Profile = () => {
  const { user, docSnap, setUser } = useAuth();
  const [eventTitle, setEventTitle] = useState("");
  const [eventHashtag, setEventHashtag] = useState("");
  const link = window.location.hostname;

  useEffect(() => {
    if (docSnap) {
      setEventTitle(docSnap?.eventTitle || "");
      setEventHashtag(docSnap?.eventHashtag || "");
    } else if (!user) {
      setUser(null);
    }
  }, [docSnap, user, setUser]);

  const handleSave = async () => {
    if (!user) return;
    try {
      await setDoc(doc(collection(db, "events"), user?.uid), {
        eventLink: `${link}/events/${user?.uid}`,
        email: user.email,
        eventTitle: eventTitle,
        eventHashtag: eventHashtag,
        uid: user.uid,
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const copyEventLink = () => {
    navigator.clipboard.writeText(`https://${link}/events/${user?.uid}`);
  };

  return (
    <>{user && (
      <div className="profile">
      <div className="profile-container">
        <div>
          <label htmlFor="eventTitle">Event Title:</label>
          <input
            type="text"
            id="eventTitle"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="eventHashtag">Event Hashtag:</label>
          <input
            type="text"
            id="eventHashtag"
            value={eventHashtag || ""}
            onChange={(e) => setEventHashtag(`${e.target.value}`)}
          />
        </div>
          <button className="save" onClick={handleSave}>
            Save
          </button>
          <div className="buttons">
            <button onClick={copyEventLink}>Copy Event Link</button>
            <button
              onClick={() => (window.location.href = `/events/${user?.uid}`)}
            >
              Go To Event
            </button>
          </div>
          <QRCodeGenerator url={`https://${link}/events/${user?.uid}`} />
        </div>
      </div>)
      }
    </>
  );
};

export default Profile;
