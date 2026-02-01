import { NavLink } from "react-router-dom";
import { useContext, useState } from "react";
import "../../styles/navbar.css";
import { AuthContext } from "../../context/AuthContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logoutUser } = useContext(AuthContext);
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return (
    <nav className="navbar">
      <div className="nav-left">
        <img src="/logo.png" alt="LOGO" />
      </div>

      <div className="menu-toggle" onClick={toggleMenu}>
        ☰
      </div>

      <ul className={`nav-links ${isMenuOpen ? "open" : ""}`}>
        <li>
          <NavLink to="/" end onClick={() => setIsMenuOpen(false)}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/yatra" onClick={() => setIsMenuOpen(false)}>
            My Yatra
          </NavLink>
        </li>
        <li>
          <NavLink to="/news" onClick={() => setIsMenuOpen(false)}>
            News
          </NavLink>
        </li>
        {user && <li><NavLink to="/profile">Profile</NavLink></li>}
        {user ? (
          <li onClick={logoutUser} style={{ cursor: "pointer" }}>Logout</li>
        ) : (
          <li><NavLink to="/auth">Login</NavLink></li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
