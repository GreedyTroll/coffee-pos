import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css'; // Import the CSS file

const Navbar = ({ isAuthenticated }) => {
  return (
    <nav className="navbar">
      <div className="navContainer">
        <ul className="navList">
          {isAuthenticated ? (
            <>
              <li className="navItem"><Link to="/home" className="navButton">Home</Link></li>
              <li className="navItem"><Link to="/menu" className="navButton">Menu</Link></li>
              <li className="navItem"><Link to="/settings" className="navButton">Settings</Link></li>
            </>
          ) : (
            <>
              <li className="navItem"><Link to="/" className="navButton">Home</Link></li>
              <li className="navItem"><Link to="/menu" className="navButton">Menu</Link></li>
              <li className="navItem"><Link to="/login" className="navButton">Login</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
