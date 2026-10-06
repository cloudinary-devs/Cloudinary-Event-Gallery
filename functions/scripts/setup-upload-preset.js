/**
 * Creates (or updates) the signed upload preset guests upload through.
 *
 * Usage:
 *   CLOUDINARY_URL=cloudinary://<key>:<secret>@<cloud> \
 *   WEBHOOK_URL=https://us-east1-<project>.cloudfunctions.net/cloudinaryWebhook \
 *   npm run setup:preset
 *
 * Optional env:
 *   UPLOAD_PRESET  preset name (default: eventography_guest)
 *   MODERATION     moderation kind, e.g. "aws_rek" (requires the Amazon
 *                  Rekognition add-on); set to "none" to disable
 */
import { v2 as cloudinary } from "cloudinary";

const name = process.env.UPLOAD_PRESET ?? "eventography_guest";
const webhookUrl = process.env.WEBHOOK_URL;
const moderation = process.env.MODERATION ?? "aws_rek";

if (!process.env.CLOUDINARY_URL || !webhookUrl) {
  console.error("CLOUDINARY_URL and WEBHOOK_URL must be set.");
  process.exit(1);
}

const settings = {
  // Signed: only requests signed by the signUpload function are accepted, so
  // these settings can't be overridden from the browser.
  unsigned: false,
  // Random, collision-free public IDs; never overwrite another guest's file.
  use_filename: false,
  unique_filename: true,
  overwrite: false,
  allowed_formats: "jpg,jpeg,png,webp,heic,heif,avif,gif,mp4,mov,webm,m4v",
  notification_url: webhookUrl,
  ...(moderation !== "none" && { moderation }),
};

try {
  await cloudinary.api.upload_preset(name);
  await cloudinary.api.update_upload_preset(name, settings);
  console.log(`Updated upload preset "${name}".`);
} catch (error) {
  if (error?.error?.http_code !== 404) throw error;
  await cloudinary.api.create_upload_preset({ name, ...settings });
  console.log(`Created upload preset "${name}".`);
}
