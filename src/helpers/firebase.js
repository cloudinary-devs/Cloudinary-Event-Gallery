import { initializeApp } from "firebase/app";
import {
  collection,
  doc,
  getDoc,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const functions = getFunctions(app, "us-east1");

export const getEventData = async (eventId) => {
  const docSnap = await getDoc(doc(db, "events", eventId));
  return docSnap.exists() ? docSnap.data() : null;
};

/**
 * Save the host's event settings. `merge` keeps fields this form doesn't own
 * (e.g. legacy `images`/`thumbnails` arrays) instead of wiping them.
 */
export const saveEventData = (eventId, data) =>
  setDoc(doc(db, "events", eventId), data, { merge: true });

/**
 * Live, newest-first view of an event's approved media. Media docs are written
 * only by the Cloudinary webhook function, so this lists exactly what
 * Cloudinary stored and moderation approved.
 */
export const subscribeToEventMedia = (eventId, pageSize, onChange, onError) =>
  onSnapshot(
    query(collection(db, "events", eventId, "media"), orderBy("createdAt", "desc"), limit(pageSize)),
    (snapshot) => onChange(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError,
  );

const signUploadCallable = httpsCallable(functions, "signUpload");

export const signUpload = async (eventId, paramsToSign) => {
  const { data } = await signUploadCallable({ eventId, paramsToSign });
  return data.signature;
};
