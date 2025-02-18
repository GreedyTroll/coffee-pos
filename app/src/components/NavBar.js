import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import './NavBar.css';

const Navbar = () => {
  const auth = useAuth();

  const handleLogin = () => {
    auth.signinRedirect();
  };

  const handleLogout = () => {
    // Remove the user from local session
    auth.removeUser();

    // Then redirect to Cognito’s logout endpoint
    const clientId = process.env.REACT_APP_COGNITO_CLIENT_ID;
    const logoutUri = process.env.REACT_APP_LOGOUT_URI;
    const cognitoDomain = process.env.REACT_APP_COGNITO_DOMAIN;
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  const userGroups = auth.user?.profile?.['cognito:groups'] || [];

  return (
    <nav className="navbar">
      <div className="navContainer">
        <ul className="navList">
          <li className="navItem"><Link to="/" className="navButton">Home</Link></li>
          <li className="navItem"><Link to="/menu" className="navButton">Menu</Link></li>
          {auth.isAuthenticated ? (
            <>
              <li className="navItem"><Link to="/management" className="navButton">Management</Link></li>
              {userGroups.includes('manager') && (
                <li className="navItem"><Link to="/stats" className="navButton">Stats</Link></li>
              )}
              <li className="navItem"><a onClick={handleLogout} className="navButton" >Logout</a></li>
            </>
          ) : (
            <li className="navItem"><a onClick={handleLogin} className="navButton">Login</a></li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
