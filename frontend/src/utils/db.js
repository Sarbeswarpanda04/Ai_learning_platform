/**
 * IndexedDB Utility for Offline Storage
 */
import { openDB } from 'idb';

const DB_NAME = 'AILearningPlatform';
const DB_VERSION = 1;

// Initialize IndexedDB
export const initDB = async () => {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Lessons store
      if (!db.objectStoreNames.contains('lessons')) {
        const lessonStore = db.createObjectStore('lessons', { keyPath: 'id' });
        lessonStore.createIndex('subject', 'subject');
        lessonStore.createIndex('difficulty', 'difficulty');
      }

      // Quizzes store
      if (!db.objectStoreNames.contains('quizzes')) {
        const quizStore = db.createObjectStore('quizzes', { keyPath: 'id' });
        quizStore.createIndex('lesson_id', 'lesson_id');
      }

      // Offline attempts store
      if (!db.objectStoreNames.contains('offlineAttempts')) {
        const attemptStore = db.createObjectStore('offlineAttempts', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        attemptStore.createIndex('synced', 'synced');
        attemptStore.createIndex('timestamp', 'timestamp');
      }

      // User data store
      if (!db.objectStoreNames.contains('userData')) {
        db.createObjectStore('userData', { keyPath: 'key' });
      }
    },
  });

  return db;
};

// Lesson Operations
export const saveLessonOffline = async (lesson) => {
  const db = await initDB();
  await db.put('lessons', lesson);
};

export const getLessonOffline = async (id) => {
  const db = await initDB();
  return await db.get('lessons', id);
};

export const getAllLessonsOffline = async () => {
  const db = await initDB();
  return await db.getAll('lessons');
};

export const deleteLessonOffline = async (id) => {
  const db = await initDB();
  await db.delete('lessons', id);
};

// Quiz Operations
export const saveQuizOffline = async (quiz) => {
  const db = await initDB();
  await db.put('quizzes', quiz);
};

export const getQuizOffline = async (id) => {
  const db = await initDB();
  return await db.get('quizzes', id);
};

export const getQuizzesByLessonOffline = async (lessonId) => {
  const db = await initDB();
  const index = db.transaction('quizzes').store.index('lesson_id');
  return await index.getAll(lessonId);
};

// Offline Attempt Operations
export const saveAttemptOffline = async (attempt) => {
  const db = await initDB();
  const attemptData = {
    ...attempt,
    synced: false,
    timestamp: new Date().toISOString(),
  };
  return await db.add('offlineAttempts', attemptData);
};

export const getUnsyncedAttempts = async () => {
  try {
    const db = await initDB();
    const tx = db.transaction('offlineAttempts', 'readonly');
    const store = tx.store;
    
    // Get all attempts and filter manually to avoid IDBKeyRange issues
    const allAttempts = await store.getAll();
    await tx.done;
    
    // Filter for unsynced attempts
    return allAttempts.filter(attempt => !attempt.synced);
  } catch (error) {
    console.error('Error getting unsynced attempts:', error);
    return [];
  }
};

export const markAttemptSynced = async (id) => {
  const db = await initDB();
  const attempt = await db.get('offlineAttempts', id);
  if (attempt) {
    attempt.synced = true;
    await db.put('offlineAttempts', attempt);
  }
};

export const clearSyncedAttempts = async () => {
  try {
    const db = await initDB();
    const tx = db.transaction('offlineAttempts', 'readwrite');
    const store = tx.store;
    
    // Get all attempts and filter manually
    const allAttempts = await store.getAll();
    const syncedAttempts = allAttempts.filter(attempt => attempt.synced);
    
    for (const attempt of syncedAttempts) {
      await store.delete(attempt.id);
    }
    
    await tx.done;
  } catch (error) {
    console.error('Error clearing synced attempts:', error);
  }
};

// User Data Operations
export const saveUserData = async (key, data) => {
  const db = await initDB();
  await db.put('userData', { key, data, timestamp: Date.now() });
};

export const getUserData = async (key) => {
  const db = await initDB();
  const result = await db.get('userData', key);
  return result?.data;
};

// Clear all offline data
export const clearAllOfflineData = async () => {
  const db = await initDB();
  await db.clear('lessons');
  await db.clear('quizzes');
  await db.clear('offlineAttempts');
  await db.clear('userData');
};

// Delete and recreate the entire database (useful for fixing corrupt data)
export const resetDatabase = async () => {
  try {
    // Close any open connections
    const db = await openDB(DB_NAME, DB_VERSION);
    db.close();
    
    // Delete the database
    await new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(DB_NAME);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      request.onblocked = () => {
        console.warn('Database deletion blocked. Please close all tabs using this app.');
        reject(new Error('Database deletion blocked'));
      };
    });
    
    console.log('Database deleted successfully');
    
    // Reinitialize
    await initDB();
    console.log('Database reinitialized successfully');
    return true;
  } catch (error) {
    console.error('Error resetting database:', error);
    return false;
  }
};

// Check if data exists offline
export const hasOfflineData = async () => {
  const db = await initDB();
  const lessonCount = await db.count('lessons');
  return lessonCount > 0;
};

export default {
  initDB,
  saveLessonOffline,
  getLessonOffline,
  getAllLessonsOffline,
  saveQuizOffline,
  getQuizOffline,
  getQuizzesByLessonOffline,
  saveAttemptOffline,
  getUnsyncedAttempts,
  markAttemptSynced,
  clearSyncedAttempts,
  saveUserData,
  getUserData,
  clearAllOfflineData,
  hasOfflineData,
};
