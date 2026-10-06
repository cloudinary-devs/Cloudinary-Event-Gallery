import { useEffect, useRef, useState } from "react";
import { signUpload } from "./helpers/firebase";

const WIDGET_SCRIPT_URL = "https://upload-widget.cloudinary.com/latest/global/all.js";
const MB = 1024 * 1024;

let scriptPromise;
const loadWidgetScript = () => {
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = WIDGET_SCRIPT_URL;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => {
      scriptPromise = undefined;
      reject(new Error("Could not load the upload widget."));
    };
    document.body.appendChild(script);
  });
  return scriptPromise;
};

/**
 * Guest uploader for one event. Uploads are signed per request by the
 * `signUpload` function, which only signs uploads into `events/{eventId}`
 * through the moderated preset, so guests can't write anywhere else.
 */
function CloudinaryUploadWidget({ eventId }) {
  const widgetRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState({ uploaded: 0, failed: 0, error: null });

  useEffect(() => {
    let cancelled = false;

    loadWidgetScript()
      .then(() => {
        if (cancelled) return;
        widgetRef.current = window.cloudinary.createUploadWidget(
          {
            cloudName: import.meta.env.VITE_CLOUD_NAME,
            apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
            uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? "eventography_guest",
            folder: `events/${eventId}`,
            tags: [`event_${eventId}`],
            uploadSignature: (callback, paramsToSign) => {
              signUpload(eventId, paramsToSign)
                .then(callback)
                .catch((error) => {
                  setStatus((s) => ({ ...s, error: error.message }));
                  widgetRef.current?.close({ quiet: true });
                });
            },
            // "local" opens the native picker, which on phones also offers
            // the camera and photo library; "camera" adds webcam on desktop.
            sources: ["local", "camera"],
            multiple: true,
            maxFiles: 50,
            resourceType: "auto",
            clientAllowedFormats: ["image", "video"],
            maxImageFileSize: 25 * MB,
            maxVideoFileSize: 500 * MB,
            // Downscale huge phone photos in the browser before upload: much
            // faster on mobile data, no visible loss at gallery sizes.
            maxImageWidth: 4096,
            maxImageHeight: 4096,
            singleUploadAutoClose: false,
            showAdvancedOptions: false,
            showSkipCropButton: false,
            styles: { palette: { action: "#646cff", inProgress: "#646cff", complete: "#20B832" } },
          },
          (error, result) => {
            if (error) {
              setStatus((s) => ({ ...s, failed: s.failed + 1 }));
            } else if (result.event === "success") {
              // The gallery updates on its own once Cloudinary's webhook
              // confirms the file passed moderation.
              setStatus((s) => ({ ...s, uploaded: s.uploaded + 1 }));
            }
          },
        );
        setReady(true);
      })
      .catch((error) => !cancelled && setStatus((s) => ({ ...s, error: error.message })));

    return () => {
      cancelled = true;
      widgetRef.current?.destroy();
      widgetRef.current = null;
    };
  }, [eventId]);

  const openWidget = () => {
    setStatus({ uploaded: 0, failed: 0, error: null });
    widgetRef.current?.open();
  };

  const { uploaded, failed, error } = status;

  return (
    <div className="uploader">
      <button className="upload-button" onClick={openWidget} disabled={!ready}>
        {ready ? "Upload photos & videos" : "Loading uploader…"}
      </button>
      <p className="upload-status" role="status" aria-live="polite">
        {error && `Upload failed: ${error}`}
        {!error && uploaded > 0 && `${uploaded} uploaded — they'll appear in the gallery after a quick safety check.`}
        {!error && failed > 0 && ` ${failed} couldn't be uploaded.`}
      </p>
    </div>
  );
}

export default CloudinaryUploadWidget;
