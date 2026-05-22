import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Route protection wrapper.
 * Redirects to /login if user is not authenticated.
 */
const ProtectedRoute = () => {
  const { token, isAuthenticated } = useSelector((state) => state.auth);

  if (!token && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
