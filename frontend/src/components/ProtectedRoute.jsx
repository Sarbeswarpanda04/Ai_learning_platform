import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../utils/store';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user, setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if tokens exist in localStorage but state hasn't rehydrated yet
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const storedAuth = localStorage.getItem('auth-storage');
      
      if (accessToken && storedAuth && !isAuthenticated) {
        try {
          const authData = JSON.parse(storedAuth);
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
      
      // Wait a bit for state to update
      setTimeout(() => {
        console.log('ProtectedRoute - post-check:', {
          accessToken: localStorage.getItem('accessToken') ? 'present' : 'missing',
          authStorage: !!localStorage.getItem('auth-storage'),
          isAuthenticated,
          user: user?.email || user?.name || null
        });
        setIsLoading(false);
      }, 150);
    };

    checkAuth();
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication - be more lenient
  const accessToken = localStorage.getItem('accessToken');
  
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  // Check role authorization if roles are specified
  if (roles.length > 0 && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
