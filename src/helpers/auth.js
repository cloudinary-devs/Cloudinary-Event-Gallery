// Imported lazily by AuthContext: only hosts sign in, so guests opening an
// event or gallery link don't pay for Firebase Auth on first load.
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { app } from "./firebase";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const subscribeToAuth = (callback) => onAuthStateChanged(auth, callback);
export const signInWithGoogle = () => signInWithPopup(auth, provider);
export const logout = () => signOut(auth);
