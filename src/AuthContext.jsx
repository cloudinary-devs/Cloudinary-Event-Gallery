/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from "react";
import { auth } from "./helpers/firebase";
import { getEventData } from "./helpers/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import PropTypes from 'prop-types';
const provider = new GoogleAuthProvider();
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [docSnap, setDocSnap] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const eventData = await getEventData(user.uid);
          setDocSnap(eventData);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };
  
    if (!user) {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        setUser(user);
      });
      return () => {
        unsubscribe();
      };
    } else {
      fetchData();
    }
  }, [user]);
  
  

  const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        setUser(user);
        window.location.href = "/profile";
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        setUser(null);
        window.location.href = "/";
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <AuthContext.Provider value={{ user, docSnap, signInWithGoogle, handleLogout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
