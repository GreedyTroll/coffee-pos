import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import ProtectedRoute from './components/ProtectedRoute';
import NavBar from './components/NavBar';
import './App.css';
import Menu from './components/Menu';

// Define the Home component
const Home = () => (
  <div className="home-container">
    <h1>Coffee</h1>
  </div>
);

function App () {

  return (
    <Router>
      <div className="app-container">
        <div className="main-content">
          <NavBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            {/*<Route path="/seats" element={<ProtectedRoute component={SeatsTable} />} />
            <Route path="/employees" element={<ProtectedRoute component={EmployeesTable} />} />
            */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
