import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

const ProtectedRoute = ({ component: Component, requiredGroup }) => {
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

  const userGroups = auth.user?.profile?.['cognito:groups'] || [];

  if (!auth.isAuthenticated || (requiredGroup && !userGroups.includes(requiredGroup))) {
    return <Navigate to="/login" />;
  }

  return <Component />;
};

export default ProtectedRoute;
