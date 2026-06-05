/**
 * useDriveHistory — Hook for managing stored drive sessions
 */
import { useState, useCallback, useEffect } from 'react';
import { storageService } from '@/services/storageService';
import type { DriveSession } from '@/types';

export type HistoryFilter = 'all' | 'best' | 'latest' | 'worst';

export function useDriveHistory() {
  const [sessions, setSessions] = useState<DriveSession[]>([]);
  const [stats, setStats] = useState({
    totalDrives: 0,
    bestScore: 0,
    averageScore: 0,
    totalEvents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<HistoryFilter>('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [allSessions, allStats] = await Promise.all([
        storageService.getAllSessions(),
        storageService.getStats(),
      ]);
      setSessions(allSessions);
      setStats(allStats);
    } catch (error) {
      console.error('Failed to load drive history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredSessions = useCallback((): DriveSession[] => {
    const sorted = [...sessions];
    switch (filter) {
      case 'best':
        return sorted.sort((a, b) => b.score - a.score);
      case 'worst':
        return sorted.sort((a, b) => a.score - b.score);
      case 'latest':
        return sorted.sort((a, b) => b.startTime - a.startTime);
      case 'all':
      default:
        return sorted.sort((a, b) => b.startTime - a.startTime);
    }
  }, [sessions, filter]);

  const deleteSession = useCallback(async (id: string) => {
    await storageService.deleteSession(id);
    await loadData();
  }, [loadData]);

  const getSession = useCallback(async (id: string) => {
    return storageService.getSession(id);
  }, []);

  return {
    sessions: filteredSessions(),
    stats,
    loading,
    filter,
    setFilter,
    refresh: loadData,
    deleteSession,
    getSession,
  };
}
