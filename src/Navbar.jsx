import { useState } from "react";
import "./Navbar.css"; // Import the CSS file
import { useAuth } from "./AuthContext";

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const { user, signInWithGoogle, handleLogout } = useAuth();

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <nav className="navbar">
      <h2>Eventography</h2>
      <div className={`menu ${showMenu ? "show" : ""}`}>
        <ul>
          {!user && (
            <li>
              <a href="/">Home</a>
            </li>
          )}
          {user ? (
            <>
              <li>
                <a href="/profile">Profile</a>
              </li>
              <li>
                <a href={`/events/${user.uid}`}>Event</a>
              </li>
              <li>
                <a href={`/galleries/${user.uid}`}>Gallery</a>
              </li>
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </>
          ) : (
            <>
              <li>
                <button onClick={signInWithGoogle}>Login</button>
              </li>
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
