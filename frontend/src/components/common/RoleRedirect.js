import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RoleRedirect = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  switch (currentUser.role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'store_owner':
      return <Navigate to="/store-owner" replace />;
    case 'user':
    default:
      return <Navigate to="/user" replace />;
  }
};

export default RoleRedirect;


