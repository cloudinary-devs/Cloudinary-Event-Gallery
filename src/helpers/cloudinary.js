import { Cloudinary } from "@cloudinary/url-gen";

export const cld = new Cloudinary({
  cloud: { cloudName: import.meta.env.VITE_CLOUD_NAME },
  // No `_a=` analytics query param: keeps CDN cache keys identical across SDK
  // upgrades and deploys.
  url: { secure: true, analytics: false },
});

/**
 * Width buckets used for every gallery request. Keeping the set of transforms
 * small and fixed means thousands of guests viewing the same event at once all
 * hit the same handful of CDN-cached derivatives instead of each generating
 * their own (which is what arbitrary per-device widths would cause).
 */
const THUMB_WIDTHS = [160, 240, 320, 480, 640];
const FULL_WIDTHS = [640, 1080, 1600, 2400];

const assetFor = (publicId, resourceType) =>
  resourceType === "video" ? cld.video(publicId) : cld.image(publicId);

// Videos are delivered as a still frame: so_auto picks a representative frame
// and f_auto:image serves it as WebP/AVIF/JPEG per browser.
const thumbUrl = (publicId, resourceType, width) =>
  assetFor(publicId, resourceType)
    .addTransformation(
      `${resourceType === "video" ? "so_auto," : ""}c_fill,g_auto,ar_1:1,w_${width}/` +
        `${resourceType === "video" ? "f_auto:image" : "f_auto"},q_auto`,
    )
    .toURL();

/** `src`/`srcSet` for a square grid thumbnail. */
export const thumbnailSources = (publicId, resourceType = "image") => ({
  src: thumbUrl(publicId, resourceType, 320),
  srcSet: THUMB_WIDTHS.map((w) => `${thumbUrl(publicId, resourceType, w)} ${w}w`).join(", "),
});

/** Smallest bucket that covers the viewer's screen at their pixel density. */
export const fullWidthFor = (viewportWidth, dpr = 1) =>
  FULL_WIDTHS.find((w) => w >= viewportWidth * Math.min(dpr, 2)) ?? FULL_WIDTHS.at(-1);

export const fullImageUrl = (publicId, width) =>
  cld.image(publicId).addTransformation(`c_limit,w_${width},h_${width}/f_auto,q_auto`).toURL();

// Tiny blurred preview shown while the full image loads.
export const placeholderUrl = (publicId) =>
  cld.image(publicId).addTransformation("c_limit,w_64/e_blur:200,q_auto:low,f_auto").toURL();

export const videoUrl = (publicId) =>
  cld.video(publicId).addTransformation("c_limit,w_1280,h_1280/f_auto:video,q_auto").toURL();

export const videoPosterUrl = (publicId) =>
  cld.video(publicId).addTransformation("so_auto,c_limit,w_1280,h_1280/f_auto:image,q_auto").toURL();

/**
 * Older events stored full delivery URLs (in `thumbnails`) instead of public
 * IDs. Recover the public ID so those images get the same optimized delivery.
 */
export const legacyUrlToMedia = (url) => {
  const match = /\/(image|video)\/upload\/(?:.*?\/)?(?:v\d+\/)(.+)\.[a-z0-9]+$/i.exec(url);
  return match ? { publicId: match[2], resourceType: match[1] } : null;
};
