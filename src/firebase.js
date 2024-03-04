// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCAvRBPcc8n3_e1jVWQVb25wBYbjFcOw2c",
    authDomain: "boda-1c364.firebaseapp.com",
    projectId: "boda-1c364",
    storageBucket: "boda-1c364.appspot.com",
    messagingSenderId: "1056401293243",
    appId: "1:1056401293243:web:43d68a193b01f9009bce9e"
};
  
  // Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const auth = getAuth(app);