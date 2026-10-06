/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getEventData } from "./helpers/firebase";

const loadAuth = () => import("./helpers/auth");
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // undefined while Firebase restores the session, then a user or null.
  const [user, setUser] = useState(undefined);
  const [loadedEvent, setLoadedEvent] = useState({ uid: null, data: null });

  useEffect(() => {
    let unsubscribe;
    let cancelled = false;
    loadAuth().then(({ subscribeToAuth }) => {
      if (!cancelled) unsubscribe = subscribeToAuth(setUser);
    });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getEventData(user.uid).then(
      (data) => !cancelled && setLoadedEvent({ uid: user.uid, data }),
      (error) => console.error("Error fetching event:", error),
    );
    return () => {
      cancelled = true;
    };
  }, [user]);

  const refreshEvent = useCallback(async () => {
    if (!user) return;
    const data = await getEventData(user.uid);
    setLoadedEvent({ uid: user.uid, data });
  }, [user]);

  // Never expose a previous user's event after sign-out or account switch.
  const event = user && loadedEvent.uid === user.uid ? loadedEvent.data : null;

  const signInWithGoogle = async () => (await loadAuth()).signInWithGoogle();
  const logout = async () => (await loadAuth()).logout();

  return <AuthContext value={{ user, event, refreshEvent, signInWithGoogle, logout }}>{children}</AuthContext>;
};

export const useAuth = () => useContext(AuthContext);
