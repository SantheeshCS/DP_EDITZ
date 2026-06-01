import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Route guard component to check for admin JWT presence.
 * Redirects to /login if missing.
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
