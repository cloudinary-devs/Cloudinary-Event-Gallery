// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore'
import { doc, getDoc } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAoDftDS82tE8ZXHko3faTzXFRZ-i_3cLc",
  authDomain: "eventographyapp.firebaseapp.com",
  projectId: "eventographyapp",
  storageBucket: "eventographyapp.appspot.com",
  messagingSenderId: "323797368260",
  appId: "1:323797368260:web:69f435bd8cdaaf65b33891",
  measurementId: "G-4SZELCTGEH"
};

export const getEventData = async (userId) => {
  const docRef = doc(db, "events", userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    console.log("No such document!");
    return null;
  }
};
  
  // Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const auth = getAuth(app);