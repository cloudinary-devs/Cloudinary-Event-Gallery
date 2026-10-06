import { test } from "node:test";
import assert from "node:assert/strict";
import {
  eventIdFromPublicId,
  isValidEventId,
  mediaDocId,
  moderationVerdict,
  validateParamsToSign,
} from "./uploadPolicy.js";

const eventId = "AbCdEf1234567890XyZ123456789";
const now = 1_790_000_000_000;
const options = { eventId, uploadPreset: "eventography_guest", now };
const validParams = {
  timestamp: now / 1000,
  source: "uw",
  upload_preset: "eventography_guest",
  folder: `events/${eventId}`,
  tags: `event_${eventId}`,
};

test("accepts the params the widget sends for this event", () => {
  assert.equal(validateParamsToSign(validParams, options), null);
  assert.equal(validateParamsToSign({ ...validParams, tags: [`event_${eventId}`] }, options), null);
});

test("refuses uploads into another event's folder", () => {
  assert.match(validateParamsToSign({ ...validParams, folder: "events/someoneElse" }, options), /folder/);
  assert.match(validateParamsToSign({ ...validParams, folder: `events/${eventId}/../x` }, options), /folder/);
});

test("refuses a different preset or missing/extra tags", () => {
  assert.match(validateParamsToSign({ ...validParams, upload_preset: "unsigned" }, options), /upload_preset/);
  assert.match(validateParamsToSign({ ...validParams, tags: undefined }, options), /tags/);
  assert.match(validateParamsToSign({ ...validParams, tags: `event_${eventId},x` }, options), /tags/);
});

test("refuses params that change storage or moderation", () => {
  for (const key of ["public_id", "overwrite", "notification_url", "moderation", "type", "eager"]) {
    assert.match(validateParamsToSign({ ...validParams, [key]: "x" }, options), new RegExp(key));
  }
});

test("refuses stale or missing timestamps", () => {
  assert.match(validateParamsToSign({ ...validParams, timestamp: now / 1000 - 3600 }, options), /timestamp/);
  assert.match(validateParamsToSign({ ...validParams, timestamp: undefined }, options), /timestamp/);
});

test("validates event IDs", () => {
  assert.equal(isValidEventId(eventId), true);
  for (const bad of ["", "../etc", "a/b", "short", null, 42]) assert.equal(isValidEventId(bad), false);
});

test("extracts the event ID from public IDs", () => {
  assert.equal(eventIdFromPublicId(`events/${eventId}/abc123`), eventId);
  assert.equal(eventIdFromPublicId(`other/${eventId}/abc123`), null);
  assert.equal(eventIdFromPublicId(`events/${eventId}/nested/abc123`), null);
  assert.equal(eventIdFromPublicId(undefined), null);
});

test("derives moderation verdicts", () => {
  assert.equal(moderationVerdict({ notification_type: "upload" }), "approved");
  assert.equal(moderationVerdict({ notification_type: "upload", moderation: [{ status: "approved" }] }), "approved");
  assert.equal(moderationVerdict({ notification_type: "upload", moderation: [{ status: "pending" }] }), "pending");
  assert.equal(moderationVerdict({ notification_type: "upload", moderation: [{ status: "rejected" }] }), "rejected");
  assert.equal(moderationVerdict({ notification_type: "moderation", moderation_status: "approved" }), "approved");
  assert.equal(moderationVerdict({ notification_type: "moderation", moderation_status: "rejected" }), "rejected");
});

test("media doc IDs are stable and slash-free", () => {
  assert.equal(mediaDocId(`events/${eventId}/abc`), `events__${eventId}__abc`);
});
