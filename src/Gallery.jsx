import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import "./Gallery.css";
import { getEventData, subscribeToEventMedia } from "./helpers/firebase";
import {
  fullImageUrl,
  fullWidthFor,
  legacyUrlToMedia,
  placeholderUrl,
  thumbnailSources,
  videoPosterUrl,
  videoUrl,
} from "./helpers/cloudinary";

const PAGE_SIZE = 48;
// Matches the grid in Gallery.css so the browser picks the right srcset entry.
const THUMB_SIZES = "(max-width: 480px) 50vw, (max-width: 900px) 33vw, 240px";

function Lightbox({ item, onClose }) {
  const [loaded, setLoaded] = useState(false);
  const width = fullWidthFor(window.innerWidth, window.devicePixelRatio);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="lightbox" role="dialog" aria-modal="true" onClick={onClose}>
      <button className="close-btn" onClick={onClose} aria-label="Close">
        ✕
      </button>
      {item.resourceType === "video" ? (
        <video
          className="lightbox-media"
          src={videoUrl(item.publicId)}
          poster={videoPosterUrl(item.publicId)}
          controls
          autoPlay
          playsInline
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <img
          className="lightbox-media"
          src={fullImageUrl(item.publicId, width)}
          alt=""
          decoding="async"
          style={loaded ? undefined : { backgroundImage: `url(${placeholderUrl(item.publicId)})` }}
          onLoad={() => setLoaded(true)}
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </div>
  );
}

const Gallery = () => {
  const { id: eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [media, setMedia] = useState(null);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);
  const closeLightbox = useCallback(() => setSelected(null), []);

  useEffect(() => {
    getEventData(eventId).then(setEvent, setError);
  }, [eventId]);

  // Live: new uploads appear for everyone viewing without a refresh. Only the
  // visible page is subscribed, so a viewer never downloads the whole event.
  useEffect(
    () => subscribeToEventMedia(eventId, pageSize, setMedia, setError),
    [eventId, pageSize],
  );

  const legacyMedia = useMemo(
    () =>
      (event?.thumbnails ?? [])
        .map(legacyUrlToMedia)
        .filter(Boolean)
        .reverse()
        .map((m) => ({ id: m.publicId, ...m })),
    [event],
  );

  const hasMore = media?.length === pageSize;
  const items = media ? [...media, ...(hasMore ? [] : legacyMedia)] : [];

  return (
    <div className="gallery">
      <header className="gallery-header">
        {event?.eventTitle && <h2>{event.eventTitle}</h2>}
        <Link className="button" to={`/events/${eventId}`}>
          Upload pics
        </Link>
      </header>

      {error && <p className="gallery-message">Couldn&apos;t load this gallery.</p>}
      {!error && !media && <p className="gallery-message">Loading…</p>}
      {media && items.length === 0 && <p className="gallery-message">No photos yet — be the first to upload!</p>}

      <ul className="gallery-grid">
        {items.map((item, index) => {
          const { src, srcSet } = thumbnailSources(item.publicId, item.resourceType);
          return (
            <li key={item.id}>
              <button className="gallery-item" onClick={() => setSelected(item)}>
                <img
                  src={src}
                  srcSet={srcSet}
                  sizes={THUMB_SIZES}
                  alt=""
                  // Above-the-fold images load immediately; the rest wait
                  // until scrolled near.
                  loading={index < 12 ? "eager" : "lazy"}
                  fetchPriority={index < 4 ? "high" : "auto"}
                  decoding="async"
                  width="240"
                  height="240"
                />
                {item.resourceType === "video" && <span className="video-badge" aria-label="Video">▶</span>}
              </button>
            </li>
          );
        })}
      </ul>

      {hasMore && (
        <button className="load-more" onClick={() => setPageSize((n) => n + PAGE_SIZE)}>
          Load more
        </button>
      )}

      {selected && <Lightbox item={selected} onClose={closeLightbox} />}
    </div>
  );
};

export default Gallery;
