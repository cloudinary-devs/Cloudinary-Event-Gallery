### Eventography upgrade (October 2026)

### Dependency review

`npm audit` went from 32 issues (2 critical, 16 high) to 0. The new `functions/` backend also audits at 0. Two indirect dependencies are pinned with `overrides` until Firebase ships fixed versions: `@grpc/grpc-js` (app) and `uuid` (functions). Remove the pins once it does.

- React 18 → 19, React Router 6 → 7, Firebase 10 → 12, Vite 5 → 8, ESLint 8 → 10, qrcode.react 3 → 4
- Removed unused or replaced packages: `@cloudinary/react`, `html2canvas`, `file-saver`, `image-compressor.js`

Cloudinary problems fixed:

- An unsigned preset with a folder chosen in the browser let anyone upload anywhere and skip moderation.
- Moderation was only checked in the browser.
- `.delivery('q_auto')` passed a raw string to `delivery()`, which isn't valid.
- The widget script loaded from an old URL that now redirects, and the widget was rebuilt on every click.
- Plain `http://` URLs were stored instead of public IDs.

Other bugs fixed:

- Guests uploading at the same time overwrote each other's photos.
- Saving the profile erased the gallery.

Still open: the host's email sits in the public event record. Consider moving it to a private record.

### Target stack

- Node.js 24 LTS (Node 20 reached end of life in April 2026)
- React 19 and Vite 8 as a single-page app. There are no server-rendering or SEO needs, so Next.js isn't worth the added complexity.
- Firebase Cloud Functions v2 in `us-east1`, which needs the Blaze plan
- Firestore with security rules, the signed Cloudinary Upload Widget, `@cloudinary/url-gen`, and the `cloudinary` Node SDK

### How uploads work

1. The widget asks the `signUpload` function to sign the upload. The function signs only for an existing event that accepts uploads, into `events/{eventId}`, with the moderated preset. Any other setting is refused.
2. Cloudinary stores the file under a random name and runs moderation.
3. Cloudinary calls `cloudinaryWebhook`. The function verifies the signature, adds approved files to `events/{eventId}/media`, and removes rejected ones.

Guests have no database write access. Hosts can turn off "Accept guest uploads" on the profile page. Phone photos are shrunk to 4096px before upload.

### Fast viewing for many guests

- Images come only in a few fixed sizes, so the CDN serves them from cache to every viewer.
- `f_auto` and `q_auto` everywhere, smart-cropped thumbnails, and poster frames for videos
- Lazy loading, and 48 items at a time with live updates and "Load more"
- Each page loads separately, and guests never download the sign-in code.

### Deploy

1. Copy `.env.example` to `.env.local`, and `functions/.env.example` to `functions/.env.<project-id>`. Fill in both.
2. `firebase functions:secrets:set CLOUDINARY_API_SECRET`
3. `firebase deploy --only functions,firestore:rules`, then copy the `cloudinaryWebhook` URL.
4. In `functions/`, run `CLOUDINARY_URL=cloudinary://KEY:SECRET@CLOUD WEBHOOK_URL=<url> npm run setup:preset`. Moderation defaults to Amazon Rekognition (`aws_rek`); set `MODERATION=none` to skip it.
5. `firebase deploy --only hosting`
