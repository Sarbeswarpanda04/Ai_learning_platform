/**
 * API Utility Functions
 * Handles all HTTP requests to the backend
 */
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    const authStorage = localStorage.getItem('auth-storage');
    let storeToken = null;
    
    // Also try to get token from zustand store
    if (authStorage) {
      try {
        const authData = JSON.parse(authStorage);
        storeToken = authData.state?.accessToken;
      } catch (e) {
        console.error('Failed to parse auth-storage:', e);
      }
    }
    
    // Use whichever token is available
    const finalToken = token || storeToken;
    
    console.log('API Request Interceptor:', {
      url: config.url,
      hasLocalStorageToken: !!token,
      hasStoreToken: !!storeToken,
      usingToken: !!finalToken,
      tokenPreview: finalToken ? `${finalToken.substring(0, 30)}...` : 'none'
    });
    
    if (finalToken) {
      config.headers.Authorization = `Bearer ${finalToken}`;
    } else {
      console.warn('⚠️ No token available for request:', config.url);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't handle 401 errors for the first 10 minutes after login to prevent race conditions
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const authData = JSON.parse(authStorage);
        const loginTime = authData.state?.loginTime;
        if (loginTime) {
          const timeSinceLogin = Date.now() - loginTime;
          if (timeSinceLogin < 10 * 60 * 1000) { // 10 minutes
            console.log(`Recent login detected (${Math.round(timeSinceLogin / 1000)}s ago) - skipping 401 auto-logout for ${originalRequest.url}`);
            return Promise.reject(error);
          }
        }
      } catch (e) {
        console.error('Error parsing auth storage:', e);
      }
    }

    // If token expired, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Check if this is a refresh token request itself - don't retry
      if (originalRequest.url?.includes('/api/auth/refresh')) {
        console.error('Refresh token is invalid, logging out');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // Check if this is a non-critical ML endpoint - don't trigger logout
      const nonCriticalEndpoints = ['/api/ml/', '/api/recommend', '/api/teacher/'];
      const isNonCritical = nonCriticalEndpoints.some(endpoint => 
        originalRequest.url?.includes(endpoint)
      );

      if (isNonCritical) {
        console.warn(`Non-critical endpoint ${originalRequest.url} failed - not triggering logout`);
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        // No refresh token - don't logout, just reject
        console.warn('No refresh token found - skipping logout');
        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      isRefreshing = true;

      try {
        console.log('Attempting token refresh');
        
        // Create a new axios instance to avoid infinite loop
        const refreshResponse = await axios.post(
          `${API_URL}/api/auth/refresh`, 
          {}, 
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        const { access_token } = refreshResponse.data.data;
        console.log('Token refresh successful');
        
        localStorage.setItem('accessToken', access_token);
        
        // Update all queued requests with new token
        processQueue(null, access_token);
        
        // Update the failed request with new token and retry
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        
        isRefreshing = false;
        
        return api(originalRequest);
        
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // Don't logout on network errors
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data) => api.post('/api/auth/signup', data),
  login: (data) => api.post('/api/auth/login', data),
  googleAuth: (token) => api.post('/api/auth/google', { token }),
  getCurrentUser: () => api.get('/api/auth/me'),
  updateProfile: (data) => api.put('/api/auth/profile', data),
  changePassword: (data) => api.post('/api/auth/change-password', data),
};

// Lesson API
export const lessonAPI = {
  getLessons: (params) => api.get('/api/lessons', { params }),
  getLesson: (id) => api.get(`/api/lessons/${id}`),
  createLesson: (data) => api.post('/api/lessons', data),
  updateLesson: (id, data) => api.put(`/api/lessons/${id}`, data),
  deleteLesson: (id) => api.delete(`/api/lessons/${id}`),
  updateProgress: (id, data) => api.post(`/api/lessons/${id}/progress`, data),
  getSubjects: () => api.get('/api/lessons/subjects'),
  getMyLessons: (params) => api.get('/api/lessons/my-lessons', { params }),
};

// Quiz API
export const quizAPI = {
  getLessonQuizzes: (lessonId) => api.get(`/api/quiz/lesson/${lessonId}/quizzes`),
  getQuiz: (id) => api.get(`/api/quiz/${id}`),
  attemptQuiz: (id, data) => api.post(`/api/quiz/${id}/attempt`, data),
  startSession: (data) => api.post('/api/quiz/session/start', data),
  completeSession: (id, data) => api.post(`/api/quiz/session/${id}/complete`, data),
  createQuiz: (data) => api.post('/api/quiz', data),
  updateQuiz: (id, data) => api.put(`/api/quiz/${id}`, data),
  deleteQuiz: (id) => api.delete(`/api/quiz/${id}`),
  syncOffline: (data) => api.post('/api/quiz/sync/offline', data),
};

// ML/AI API
export const mlAPI = {
  evaluatePerformance: (data) => api.post('/api/ml/evaluate', data),
  getRecommendations: (data) => api.post('/api/ml/recommend', data),
  getLearningGaps: () => api.get('/api/ml/learning-gaps'),
  getAdaptiveHint: (data) => api.post('/api/ml/adaptive-hint', data),
  getStudentDashboard: () => api.get('/api/ml/student/dashboard'),
  getTeacherAnalytics: () => api.get('/api/ml/teacher/analytics'),
};

export default api;
