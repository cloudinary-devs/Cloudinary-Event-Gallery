/**
 * Pure helpers that decide what a guest is allowed to upload, and where.
 * Kept free of Firebase/Cloudinary imports so they can be unit tested.
 */

// Firebase Auth UIDs (our event IDs) are 28 chars of [A-Za-z0-9]; allow a bit of
// slack for custom IDs but never anything that could escape the folder.
const EVENT_ID_PATTERN = /^[A-Za-z0-9_-]{6,128}$/;

// Params the Upload Widget may legitimately send that don't affect where or how
// the asset is stored.
const PASSTHROUGH_PARAMS = new Set(["timestamp", "source", "custom_coordinates", "filename_override"]);

// A signature is only accepted for a timestamp this close to "now". Cloudinary
// itself rejects signatures older than 1 hour.
const MAX_CLOCK_SKEW_SECONDS = 10 * 60;

export const isValidEventId = (eventId) =>
  typeof eventId === "string" && EVENT_ID_PATTERN.test(eventId);

export const eventFolder = (eventId) => `events/${eventId}`;

export const eventTag = (eventId) => `event_${eventId}`;

const normalizeTags = (tags) =>
  (Array.isArray(tags) ? tags : String(tags ?? "").split(","))
    .map((tag) => tag.trim())
    .filter(Boolean);

/**
 * Validate the params the Upload Widget wants signed. Returns an error message,
 * or null when the request may be signed as-is.
 *
 * Every param that controls storage (folder, preset, tags) must equal the
 * server-side value for this event, and anything not explicitly allowed
 * (public_id, overwrite, notification_url, moderation, type, ...) is refused, so
 * a guest can never write outside `events/{eventId}` or bypass moderation.
 */
export const validateParamsToSign = (params, { eventId, uploadPreset, now = Date.now() }) => {
  if (!params || typeof params !== "object") return "Missing upload parameters.";

  const expected = {
    upload_preset: uploadPreset,
    folder: eventFolder(eventId),
  };

  for (const [key, value] of Object.entries(expected)) {
    if (params[key] !== value) return `Invalid ${key}.`;
  }

  const tags = normalizeTags(params.tags);
  if (tags.length !== 1 || tags[0] !== eventTag(eventId)) return "Invalid tags.";

  const timestamp = Number(params.timestamp);
  if (!Number.isFinite(timestamp) || Math.abs(now / 1000 - timestamp) > MAX_CLOCK_SKEW_SECONDS) {
    return "Invalid timestamp.";
  }

  for (const key of Object.keys(params)) {
    if (!(key in expected) && key !== "tags" && !PASSTHROUGH_PARAMS.has(key)) {
      return `Parameter "${key}" is not allowed.`;
    }
  }

  return null;
};

/**
 * Pull the event ID out of a public ID like `events/{eventId}/abc123`.
 */
export const eventIdFromPublicId = (publicId) => {
  const match = /^events\/([^/]+)\/[^/]+$/.exec(publicId ?? "");
  return match && isValidEventId(match[1]) ? match[1] : null;
};

/**
 * Collapse the various Cloudinary notification shapes into a moderation
 * verdict: "approved", "rejected", or "pending".
 *
 * - `upload` notifications carry a `moderation` array (empty/absent when the
 *   preset has no moderation configured, which we treat as approved).
 * - `moderation` notifications carry `moderation_status` for async moderation
 *   (e.g. video, or manual review).
 */
export const moderationVerdict = (notification) => {
  if (notification.notification_type === "moderation") {
    return notification.moderation_status ?? "pending";
  }
  const moderation = notification.moderation;
  if (!Array.isArray(moderation) || moderation.length === 0) return "approved";
  const statuses = moderation.map((entry) => entry.status);
  if (statuses.includes("rejected")) return "rejected";
  if (statuses.every((status) => status === "approved")) return "approved";
  return "pending";
};

/**
 * Firestore document ID for an asset. Derived from the public ID (not
 * `asset_id`) because every notification type includes it, so the upload and a
 * later moderation verdict for the same asset always land on the same doc.
 */
export const mediaDocId = (publicId) => publicId.replaceAll("/", "__");
