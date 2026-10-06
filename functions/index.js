import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import { defineSecret, defineString } from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import { v2 as cloudinary } from "cloudinary";
import {
  eventIdFromPublicId,
  isValidEventId,
  mediaDocId,
  moderationVerdict,
  validateParamsToSign,
} from "./uploadPolicy.js";

initializeApp();
const db = getFirestore();

const CLOUDINARY_CLOUD_NAME = defineString("CLOUDINARY_CLOUD_NAME");
const CLOUDINARY_API_KEY = defineString("CLOUDINARY_API_KEY");
const CLOUDINARY_UPLOAD_PRESET = defineString("CLOUDINARY_UPLOAD_PRESET", { default: "eventography_guest" });
const CLOUDINARY_API_SECRET = defineSecret("CLOUDINARY_API_SECRET");

const REGION = "us-east1";

const configureCloudinary = () =>
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME.value(),
    api_key: CLOUDINARY_API_KEY.value(),
    api_secret: CLOUDINARY_API_SECRET.value(),
    secure: true,
  });

/**
 * Signs Upload Widget requests for guests. Guests are anonymous, so the
 * security boundary is the params: uploads are only signed for an existing
 * event that accepts uploads, into that event's folder, with the signed preset
 * (which carries moderation + the notification webhook).
 */
export const signUpload = onCall(
  { region: REGION, secrets: [CLOUDINARY_API_SECRET], cors: true },
  async (request) => {
    const { eventId, paramsToSign } = request.data ?? {};

    if (!isValidEventId(eventId)) {
      throw new HttpsError("invalid-argument", "Invalid event.");
    }

    const event = await db.doc(`events/${eventId}`).get();
    if (!event.exists || event.get("uploadsEnabled") === false) {
      throw new HttpsError("failed-precondition", "This event is not accepting uploads.");
    }

    const error = validateParamsToSign(paramsToSign, {
      eventId,
      uploadPreset: CLOUDINARY_UPLOAD_PRESET.value(),
    });
    if (error) {
      logger.warn("Refused to sign upload", { eventId, error });
      throw new HttpsError("permission-denied", error);
    }

    const signature = cloudinary.utils.api_sign_request(paramsToSign, CLOUDINARY_API_SECRET.value());
    return { signature };
  },
);

/**
 * Cloudinary notification webhook (set as the upload preset's
 * notification_url). Records moderated-and-approved assets in
 * `events/{eventId}/media`, and removes them if later rejected.
 *
 * Writing from here (instead of from the guest's browser) means the gallery
 * only ever lists assets Cloudinary actually stored and approved, guests need
 * no Firestore write access, and concurrent uploads never clobber each other.
 */
export const cloudinaryWebhook = onRequest(
  { region: REGION, secrets: [CLOUDINARY_API_SECRET] },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method not allowed");
      return;
    }

    configureCloudinary();
    const timestamp = Number(req.get("X-Cld-Timestamp"));
    const signature = req.get("X-Cld-Signature");
    if (!signature || !cloudinary.utils.verifyNotificationSignature(req.rawBody.toString("utf8"), timestamp, signature)) {
      logger.warn("Rejected webhook with invalid signature");
      res.status(401).send("Invalid signature");
      return;
    }

    const notification = req.body;
    const { notification_type: type, public_id: publicId } = notification;
    const eventId = eventIdFromPublicId(publicId);

    // Acknowledge anything we don't handle so Cloudinary doesn't retry it.
    if (!["upload", "moderation"].includes(type) || !eventId) {
      res.status(204).end();
      return;
    }

    const mediaRef = db.doc(`events/${eventId}/media/${mediaDocId(publicId)}`);
    const verdict = moderationVerdict(notification);

    if (verdict === "rejected") {
      await mediaRef.delete();
      logger.info("Removed rejected asset", { eventId, publicId });
    } else if (verdict === "approved") {
      const resourceType = notification.resource_type ?? "image";
      await mediaRef.set(
        {
          publicId,
          resourceType,
          // Moderation notifications don't include dimensions; merge keeps any
          // values the earlier upload notification stored.
          ...(notification.width && { width: notification.width }),
          ...(notification.height && { height: notification.height }),
          ...(notification.format && { format: notification.format }),
          ...(notification.version && { version: notification.version }),
          createdAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
      logger.info("Recorded asset", { eventId, publicId, type });
    }

    res.status(204).end();
  },
);
