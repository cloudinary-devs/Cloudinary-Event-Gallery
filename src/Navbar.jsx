import { useState } from "react";
import { Link, useNavigate } from "react-router";
import "./Navbar.css";
import { useAuth } from "./AuthContext";

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const { user, signInWithGoogle, logout } = useAuth();
  const navigate = useNavigate();
  const closeMenu = () => setShowMenu(false);

  const handleLogin = async () => {
    closeMenu();
    await signInWithGoogle();
    navigate("/profile");
  };

  const handleLogout = async () => {
    closeMenu();
    await logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <h2>Eventography</h2>
      <div className={`menu ${showMenu ? "show" : ""}`}>
        <ul onClick={(e) => e.target.closest("a") && closeMenu()}>
          {user ? (
            <>
              <li>
                <Link to="/profile">Profile</Link>
              </li>
              <li>
                <Link to={`/events/${user.uid}`}>Event</Link>
              </li>
              <li>
                <Link to={`/galleries/${user.uid}`}>Gallery</Link>
              </li>
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <button onClick={handleLogin}>Login</button>
              </li>
            </>
          )}
        </ul>
      </div>
      <button
        className="hamburger-menu"
        onClick={() => setShowMenu((show) => !show)}
        aria-label="Menu"
        aria-expanded={showMenu}
      >
        <span className="line"></span>
        <span className="line"></span>
        <span className="line"></span>
      </button>
    </nav>
  );
};

export default Navbar;
