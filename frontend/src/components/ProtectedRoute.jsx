import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../utils/store';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user, setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if tokens exist in localStorage but state hasn't rehydrated yet
    const checkAuth = () => {
      const accessToken = localStorage.getItem('accessToken');
      const storedAuth = localStorage.getItem('auth-storage');
      
      console.log('ProtectedRoute - checkAuth:', {
        hasAccessToken: !!accessToken,
        hasStoredAuth: !!storedAuth,
        isAuthenticated,
        userRole: user?.role
      });
      
      if (accessToken && storedAuth && !isAuthenticated) {
        try {
          const authData = JSON.parse(storedAuth);
          console.log('ProtectedRoute - Attempting manual rehydration:', authData.state?.user?.name);
          if (authData.state && authData.state.user) {
            // Rehydrate the auth store manually
            setAuth(
              authData.state.user,
              authData.state.profile,
              authData.state.accessToken || accessToken,
              authData.state.refreshToken || localStorage.getItem('refreshToken')
            );
          }
        } catch (error) {
          console.error('Failed to rehydrate auth state:', error);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [isAuthenticated, setAuth]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Check authentication
  const accessToken = localStorage.getItem('accessToken');
  
  console.log('ProtectedRoute - Final auth check:', {
    isAuthenticated,
    hasAccessToken: !!accessToken,
    userRole: user?.role,
    requiredRoles: roles
  });
  
  if (!isAuthenticated && !accessToken) {
    console.log('ProtectedRoute - Redirecting to login (no auth)');
    return <Navigate to="/login" replace />;
  }

  // Check role authorization if roles are specified
  if (roles.length > 0 && !roles.includes(user?.role)) {
    console.log('ProtectedRoute - Redirecting to dashboard (wrong role)');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('ProtectedRoute - Access granted');
  return children;
};

export default ProtectedRoute;
