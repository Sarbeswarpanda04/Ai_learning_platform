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
    console.log('API Request Interceptor:', {
      url: config.url,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
    });
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          console.log('No refresh token found, redirecting to login');
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        console.log('Attempting token refresh with refresh token');
        
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
        console.log('Token refresh successful, updating access token');
        
        localStorage.setItem('accessToken', access_token);

        // Update the failed request with new token and retry
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
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
