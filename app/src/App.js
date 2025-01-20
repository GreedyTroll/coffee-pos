import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from 'react-oidc-context';
import ProtectedRoute from './components/ProtectedRoute';
import { cognitoAuthConfig } from './oidcConfig';
import NavBar from './components/NavBar';
import './App.css';
import Menu from './components/Menu';
import PartyManager from './components/PartyManager';

// Define the Home component
const Home = () => (
  <div className="home-container">
    <h1>Coffee</h1>
  </div>
);

// Define the Login component
const Login = () => {
  const auth = useAuth();

  React.useEffect(() => {
    auth.signinRedirect();
  }, [auth]);

  return <div>Redirecting to login...</div>;
};

const AppContent = () => {
  const auth = useAuth();

  return (
    <Router>
      <div className="app-container">
        <div className="main-content">
          <NavBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu isAuthenticated={auth.isAuthenticated} />} />
            <Route path="/management" element={<ProtectedRoute component={PartyManager} />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

function App () {
  return (
    <AuthProvider {...cognitoAuthConfig}>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
