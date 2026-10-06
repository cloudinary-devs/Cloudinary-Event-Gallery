import "./Event.css";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import CloudinaryUploadWidget from "./CloudinaryUploadWidget";
import { getEventData } from "./helpers/firebase";

function Event() {
  const { id: eventId } = useParams();
  const [event, setEvent] = useState();

  useEffect(() => {
    getEventData(eventId).then(setEvent, () => setEvent(null));
  }, [eventId]);

  if (event === undefined) return <p>Loading…</p>;
  if (event === null) return <p>This event doesn&apos;t exist.</p>;

  return (
    <div className="event">
      <h2>{event.eventTitle}</h2>
      <h3>{event.eventHashtag}</h3>
      {event.uploadsEnabled === false ? (
        <p>Uploads for this event are closed.</p>
      ) : (
        <CloudinaryUploadWidget eventId={eventId} />
      )}
      <Link className="button" to={`/galleries/${eventId}`}>
        View pictures
      </Link>
      <p className="footer">
        Created with 💜 by <a href="https://eventographyapp.com/">Eventography</a>
      </p>
    </div>
  );
}

export default Event;
