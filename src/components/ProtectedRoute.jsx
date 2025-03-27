import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, isAuthenticated } = useContext(AuthContext);
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && currentUser.role !== requiredRole) {
    // Redirect to appropriate dashboard if role doesn't match
    return <Navigate to={currentUser.role === 'admin' ? '/admin' : '/user'} />;
  }
  
  return children;
};

export default ProtectedRoute;