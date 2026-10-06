import { useState } from "react";
import { Link } from "react-router";
import "./Profile.css";
import { saveEventData } from "./helpers/firebase";
import QRCodeGenerator from "./QRCodeGenerator";
import { useAuth } from "./AuthContext";

const EventForm = ({ user, event, refreshEvent }) => {
  const [eventData, setEventData] = useState({
    eventTitle: event?.eventTitle ?? "",
    eventHashtag: event?.eventHashtag ?? "",
    uploadsEnabled: event?.uploadsEnabled !== false,
  });
  const [saveState, setSaveState] = useState(null);
  const eventUrl = `${window.location.origin}/events/${user.uid}`;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEventData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = async () => {
    setSaveState("saving");
    try {
      await saveEventData(user.uid, {
        ...eventData,
        eventLink: eventUrl,
        email: user.email,
        uid: user.uid,
      });
      await refreshEvent();
      setSaveState("saved");
    } catch (error) {
      console.error("Error saving event: ", error);
      setSaveState("error");
    }
  };

  return (
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
      <div>
        <label className="checkbox">
          <input
            type="checkbox"
            name="uploadsEnabled"
            checked={eventData.uploadsEnabled}
            onChange={handleInputChange}
          />
          Accept guest uploads
        </label>
      </div>
      <button className="save" onClick={handleSave} disabled={saveState === "saving"}>
        {saveState === "saving" ? "Saving…" : "Save"}
      </button>
      {saveState === "saved" && <p>Saved.</p>}
      {saveState === "error" && <p>Couldn&apos;t save. Please try again.</p>}
      {event && (
        <>
          <div className="buttons">
            <button onClick={() => navigator.clipboard.writeText(eventUrl)}>Copy Event Link</button>
            <Link className="button" to={`/events/${user.uid}`}>
              Go To Event
            </Link>
          </div>
          <QRCodeGenerator url={eventUrl} />
        </>
      )}
    </div>
  );
};

const Profile = () => {
  const { user, event, refreshEvent, signInWithGoogle } = useAuth();

  if (user === undefined) return <div className="profile">Loading…</div>;
  if (!user) {
    return (
      <div className="profile">
        <button onClick={signInWithGoogle}>Login</button>
      </div>
    );
  }

  return (
    <div className="profile">
      {/* Remount once the saved event arrives so the form starts from it. */}
      <EventForm key={event ? "saved" : "new"} user={user} event={event} refreshEvent={refreshEvent} />
    </div>
  );
};

export default Profile;
