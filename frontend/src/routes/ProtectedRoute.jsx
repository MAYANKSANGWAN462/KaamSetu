// Purpose: Protects routes by authentication and user action capabilities.
// frontend/src/routes/ProtectedRoute.jsx
// Route guard that checks authentication and user roles

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles?.length) {
    const canAccess = allowedRoles.some((role) => {
      if (role === 'worker') return Boolean(user?.actsAsWorker);
      if (role === 'hirer') return Boolean(user?.actsAsHirer);
      return user?.role === role;
    });

    if (!canAccess) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // If children is a function, call it with user data
  if (typeof children === 'function') {
    return children({ user });
  }

  return children || <Outlet />;
};

export default ProtectedRoute;