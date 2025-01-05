import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import ProtectedRoute from './components/ProtectedRoute';
import HamburgerMenu from './components/HamburgerMenu';
// import NavBar from './components/NavBar';
import './App.css';
// import EmployeesTable from './components/getEmployees';
import Menu from './components/Menu';

// Define the Home component
const Home = () => (
  <div> <h2>Coffee</h2> </div>
);

function App () {
  const [isHamburgerMenuOpen, setHamburgerMenuOpen] = useState(false);
  const toggleHamburgerMenu = () => {
    setHamburgerMenuOpen(!isHamburgerMenuOpen);
  };

  return (
    <Router>
      <div className={`app-container ${isHamburgerMenuOpen ? 'hamburgermenu-open' : ''}`}>
        <div className="main-content">
          {/*<NavBar />*/}
          <HamburgerMenu isOpen={isHamburgerMenuOpen} toggleHamburgerMenu={toggleHamburgerMenu} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            {/*<Route path="/seats" element={<ProtectedRoute component={SeatsTable} />} />
            <Route path="/employees" element={<ProtectedRoute component={EmployeesTable} />} />
            */}
            {/* Add more protected routes as needed */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
