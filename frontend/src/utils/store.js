/**
 * Zustand Store for Global State Management
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Auth Store
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      profile: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, profile, accessToken, refreshToken) => {
        console.log('Setting auth state:', { user: user?.name, isAuthenticated: true });
        set({
          user,
          profile,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      updateUser: (user) => set({ user }),
      updateProfile: (profile) => set({ profile }),

      logout: () => {
        console.log('Logging out, clearing auth state');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({
          user: null,
          profile: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Theme Store
export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light', // 'light' or 'dark'
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light',
      })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage',
      getStorage: () => localStorage,
    }
  )
);

// Offline Store
export const useOfflineStore = create((set) => ({
  isOnline: navigator.onLine,
  pendingSync: 0,
  
  setOnlineStatus: (status) => set({ isOnline: status }),
  setPendingSync: (count) => set({ pendingSync: count }),
  incrementPendingSync: () => set((state) => ({ pendingSync: state.pendingSync + 1 })),
  decrementPendingSync: () => set((state) => ({ 
    pendingSync: Math.max(0, state.pendingSync - 1) 
  })),
}));

// Lesson Store
export const useLessonStore = create((set) => ({
  lessons: [],
  currentLesson: null,
  loading: false,
  error: null,

  setLessons: (lessons) => set({ lessons }),
  setCurrentLesson: (lesson) => set({ currentLesson: lesson }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  addLesson: (lesson) => set((state) => ({
    lessons: [lesson, ...state.lessons],
  })),
  
  updateLesson: (id, updatedLesson) => set((state) => ({
    lessons: state.lessons.map((l) => l.id === id ? { ...l, ...updatedLesson } : l),
  })),
  
  removeLesson: (id) => set((state) => ({
    lessons: state.lessons.filter((l) => l.id !== id),
  })),
}));

// Quiz Store
export const useQuizStore = create((set) => ({
  quizzes: [],
  currentQuiz: null,
  sessionId: null,
  answers: {},
  score: 0,
  loading: false,

  setQuizzes: (quizzes) => set({ quizzes }),
  setCurrentQuiz: (quiz) => set({ currentQuiz: quiz }),
  setSessionId: (id) => set({ sessionId: id }),
  setAnswer: (quizId, answer) => set((state) => ({
    answers: { ...state.answers, [quizId]: answer },
  })),
  setScore: (score) => set({ score }),
  setLoading: (loading) => set({ loading }),
  
  resetQuiz: () => set({
    currentQuiz: null,
    answers: {},
    score: 0,
  }),
  
  resetSession: () => set({
    sessionId: null,
    answers: {},
    score: 0,
  }),
}));

export default {
  useAuthStore,
  useThemeStore,
  useOfflineStore,
  useLessonStore,
  useQuizStore,
};
