import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

/**
 * AuthGuard — Route protection wrapper.
 * 
 * Checks if the user has a valid, non-expired JWT token.
 * If not authenticated → redirect to /login with the intended path preserved.
 * If token is expired → auto-cleanup and redirect.
 */
export default function AuthGuard({ children }) {
  const location = useLocation();

  if (!authService.isAuthenticated()) {
    // Pass the current path so we can redirect back after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
