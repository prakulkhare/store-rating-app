import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && currentUser.role !== requiredRole) {
    // If user is logged in but has wrong role, redirect to their allowed dashboard
    switch (currentUser.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'store_owner':
        return <Navigate to="/store-owner" replace />;
      default:
        return <Navigate to="/user" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;