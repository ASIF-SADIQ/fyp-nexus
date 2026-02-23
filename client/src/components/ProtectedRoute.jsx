import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
  const userInfo = localStorage.getItem('userInfo') 
    ? JSON.parse(localStorage.getItem('userInfo')) 
    : null;

  // If not logged in, redirect to login
  if (!userInfo) {
    return <Navigate to="/login" />;
  }

  // If role is specified and doesn't match, redirect to login
  if (role && userInfo.role !== role) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;