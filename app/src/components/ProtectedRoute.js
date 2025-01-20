import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

const ProtectedRoute = ({ component: Component }) => {
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (auth.isAuthenticated !== undefined) {
      setIsLoading(false);
    }
  }, [auth.isAuthenticated]);

  if (isLoading) {
    return <div>Loading...</div>; // Or a spinner, etc.
  }

  return auth.isAuthenticated ? (
    <Component />
  ) : (
    <Navigate to="/login" />
  );
};

export default ProtectedRoute;
