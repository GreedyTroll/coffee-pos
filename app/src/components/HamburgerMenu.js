import React from 'react';
import { Link } from 'react-router-dom';
import './HamburgerMenu.css';

function HamburgerMenu({ isOpen, toggleHamburgerMenu }) {
  return (
    <div className={`hamburger-menu ${isOpen ? 'open' : ''}`}>
      <button className="menu-icon" onClick={toggleHamburgerMenu}>
        &#9776;
      </button>
      <div className={`menu ${isOpen ? 'show' : 'hide'}`}>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/employees">Employees</Link>
          </li>
          <li>
            <Link to="/menu">Menu</Link>
          </li>
          <li>
            <Link to="/parties">Parties</Link>
            <ul className="submenu">
              <li><Link to="/parties">管理</Link></li>
              <li><Link to="/parties">管理</Link></li>
            </ul>
          </li>
          <li><Link to="/search">搜尋</Link></li>
        </ul>
      </div>
    </div>
  );
}

export default HamburgerMenu;
