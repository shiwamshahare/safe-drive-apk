/**
 * StorageService — AsyncStorage-based persistence for drive sessions
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DriveSession } from '@/types';

const STORAGE_KEY = '@safedrive_sessions';

class StorageService {
  /**
   * Save a drive session to storage.
   */
  async saveSession(session: DriveSession): Promise<void> {
    try {
      const sessions = await this.getAllSessions();
      sessions.unshift(session); // newest first
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save drive session:', error);
      throw error;
    }
  }

  /**
   * Get all saved drive sessions, sorted by date (newest first).
   */
  async getAllSessions(): Promise<DriveSession[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data) as DriveSession[];
    } catch (error) {
      console.error('Failed to load drive sessions:', error);
      return [];
    }
  }

  /**
   * Get a single drive session by ID.
   */
  async getSession(id: string): Promise<DriveSession | null> {
    const sessions = await this.getAllSessions();
    return sessions.find((s) => s.id === id) ?? null;
  }

  /**
   * Delete a drive session by ID.
   */
  async deleteSession(id: string): Promise<void> {
    try {
      const sessions = await this.getAllSessions();
      const filtered = sessions.filter((s) => s.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete drive session:', error);
      throw error;
    }
  }

  /**
   * Get summary stats across all sessions.
   */
  async getStats(): Promise<{
    totalDrives: number;
    bestScore: number;
    averageScore: number;
    totalEvents: number;
  }> {
    const sessions = await this.getAllSessions();
    if (sessions.length === 0) {
      return { totalDrives: 0, bestScore: 0, averageScore: 0, totalEvents: 0 };
    }

    const scores = sessions.map((s) => s.score);
    const totalEvents = sessions.reduce((sum, s) => sum + s.totalEvents, 0);

    return {
      totalDrives: sessions.length,
      bestScore: Math.max(...scores),
      averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      totalEvents,
    };
  }

  /**
   * Clear all stored sessions.
   */
  async clearAll(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Completely clear AsyncStorage for a fresh restart (removes onboarding and sessions).
   */
  async resetAllData(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Failed to reset AsyncStorage:', error);
      throw error;
    }
  }
}

export const storageService = new StorageService();
