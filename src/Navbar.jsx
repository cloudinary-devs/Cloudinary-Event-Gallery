import { useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from './firebase';
import './Navbar.css'; // Import the CSS file

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const provider = new GoogleAuthProvider();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
  
      if (user) {
        setUser(user)
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);


  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        setUser(user);
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
    <nav className="navbar">
      <h2>Eventography</h2>
      <div className={`menu ${showMenu ? 'show' : ''}`}>
        <ul>
          <li><a href="/">Home</a></li>
          {user ? (
            <>
              <li><a href='/profile'>Profile</a></li>
              <li><a href={`/events/${user.uid}`}>Event</a></li>
              <li><a href={`/galleries/${user.uid}`}>Gallery</a></li>
              <li><button onClick={handleLogout}>Logout</button></li>
            </>
          ) : (
            <>
              <li><button onClick={signInWithGoogle}>Login</button></li>
            </>
          )}
        </ul>
      </div>
      <div className="hamburger-menu" onClick={toggleMenu}>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
      </div>
    </nav>
  );
};

export default Navbar;
