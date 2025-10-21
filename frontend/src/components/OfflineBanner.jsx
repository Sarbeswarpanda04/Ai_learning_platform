import React, { useEffect, useState } from 'react';
import { WifiOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useOfflineStore } from '../utils/store';
import { getUnsyncedAttempts } from '../utils/db';
import { quizAPI } from '../utils/api';
import toast from 'react-hot-toast';

const OfflineBanner = () => {
  const { isOnline, pendingSync, setPendingSync, decrementPendingSync } = useOfflineStore();
  const [syncing, setSyncing] = useState(false);

  // Check for unsynced data on mount and when coming online
  useEffect(() => {
    checkUnsyncedData();
  }, []);

  useEffect(() => {
    if (isOnline && pendingSync > 0) {
      syncOfflineData();
    }
  }, [isOnline]);

  const checkUnsyncedData = async () => {
    try {
      const unsynced = await getUnsyncedAttempts();
      if (unsynced && Array.isArray(unsynced)) {
        setPendingSync(unsynced.length);
      } else {
        setPendingSync(0);
      }
    } catch (error) {
      console.error('Error checking unsynced data:', error);
      // Don't show error to user, just set to 0
      setPendingSync(0);
    }
  };

  const syncOfflineData = async () => {
    if (syncing) return;

    setSyncing(true);
    try {
      const unsynced = await getUnsyncedAttempts();
      
      if (unsynced.length === 0) {
        setPendingSync(0);
        return;
      }

      // Sync attempts
      const response = await quizAPI.syncOffline({ attempts: unsynced });
      
      if (response.data.success) {
        const { synced_count } = response.data.data;
        toast.success(`Synced ${synced_count} quiz attempts!`);
        setPendingSync(Math.max(0, unsynced.length - synced_count));
        
        // Clean up synced data from IndexedDB
        await checkUnsyncedData();
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync offline data');
    } finally {
      setSyncing(false);
    }
  };

  if (isOnline && pendingSync === 0) {
    return null;
  }

  return (
    <div
      className={`fixed top-16 left-0 right-0 z-40 px-4 py-3 text-white text-center animate-slide-down ${
        isOnline ? 'bg-yellow-500' : 'bg-red-500'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
        {isOnline ? (
          <>
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">
              {syncing
                ? 'Syncing offline data...'
                : `${pendingSync} quiz attempt${pendingSync !== 1 ? 's' : ''} pending sync`}
            </span>
            {!syncing && (
              <button
                onClick={syncOfflineData}
                className="ml-4 px-3 py-1 bg-white text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-50 transition-colors"
              >
                Sync Now
              </button>
            )}
          </>
        ) : (
          <>
            <WifiOff className="h-5 w-5" />
            <span className="font-medium">
              You're offline - Data will sync when connection is restored
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default OfflineBanner;
