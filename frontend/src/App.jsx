import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useThemeStore, useOfflineStore, useAuthStore } from './utils/store';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import LessonList from './pages/LessonList';
import AllLessons from './pages/AllLessons';
import LessonPage from './pages/LessonPage';
import QuizPage from './pages/QuizPage';
import ProgressPage from './pages/ProgressPage';
import TeacherDashboard from './pages/TeacherDashboard';
import CreateLesson from './pages/CreateLesson';

// Components
import Navbar from './components/Navbar';
import OfflineBanner from './components/OfflineBanner';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { theme } = useThemeStore();
  const { setOnlineStatus } = useOfflineStore();
  const { isAuthenticated, setAuth } = useAuthStore();

  // Restore authentication state from localStorage on app load
  useEffect(() => {
    const restoreAuth = () => {
      try {
        const storedAuth = localStorage.getItem('auth-storage');
        const accessToken = localStorage.getItem('accessToken');
        
        if (storedAuth && accessToken && !isAuthenticated) {
          const authData = JSON.parse(storedAuth);
          if (authData.state && authData.state.user) {
            console.log('Restoring auth state from localStorage');
            setAuth(
              authData.state.user,
              authData.state.profile,
              authData.state.accessToken || accessToken,
              authData.state.refreshToken || localStorage.getItem('refreshToken')
            );
          }
        }
      } catch (error) {
        console.error('Failed to restore auth state:', error);
      }
    };

    restoreAuth();
  }, []); // Run once on mount

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus]);

  return (
    <Router>
      <div className="min-h-screen">
        {isAuthenticated && <Navbar />}
        <OfflineBanner />
        
        <main className="pb-16">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lessons"
              element={
                <ProtectedRoute>
                  <AllLessons />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lesson-list"
              element={
                <ProtectedRoute>
                  <LessonList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lessons/:id"
              element={
                <ProtectedRoute>
                  <LessonPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lesson/:id"
              element={
                <ProtectedRoute>
                  <LessonPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz/:lessonId"
              element={
                <ProtectedRoute>
                  <QuizPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <ProgressPage />
                </ProtectedRoute>
              }
            />

            {/* Teacher Routes */}
            <Route
              path="/teacher/dashboard"
              element={
                <ProtectedRoute roles={['teacher', 'admin']}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/create-lesson"
              element={
                <ProtectedRoute roles={['teacher', 'admin']}>
                  <CreateLesson />
                </ProtectedRoute>
              }
            />

            {/* Default Routes */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: theme === 'dark' ? '#374151' : '#fff',
              color: theme === 'dark' ? '#fff' : '#1f2937',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
