/**
 * useDriveSession — Main drive session lifecycle hook
 *
 * Manages the full drive lifecycle: start, active recording, stop.
 * Integrates sensor data → event detection → score calculation.
 * Tracks elapsed time, events, score, and score history.
 */
import { eventDetectionEngine } from '@/services/eventDetectionEngine';
import { scoringEngine } from '@/services/scoringEngine';
import { sensorService } from '@/services/sensorService';
import { storageService } from '@/services/storageService';
import type {
  DetectedEvent,
  DriveSession,
  DriveStatus,
  SensorSnapshot,
} from '@/types';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface DriveSessionState {
  status: DriveStatus;
  elapsedMs: number;
  score: number;
  rating: ReturnType<typeof scoringEngine.getRating>;
  events: DetectedEvent[];
  sensorData: SensorSnapshot | null;
  scoreHistory: { time: number; score: number }[];
}

export function useDriveSession() {
  const [state, setState] = useState<DriveSessionState>({
    status: 'idle',
    elapsedMs: 0,
    score: 100,
    rating: 'Excellent',
    events: [],
    sensorData: null,
    scoreHistory: [],
  });

  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const eventsRef = useRef<DetectedEvent[]>([]);
  const scoreRef = useRef<number>(100);
  const scoreHistoryRef = useRef<{ time: number; score: number }[]>([]);
  const sensorDataRef = useRef<SensorSnapshot | null>(null);

  // Timer effect — update elapsed time every second
  useEffect(() => {
    if (state.status === 'active') {
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setState((prev) => ({ ...prev, elapsedMs: elapsed }));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.status]);

  const startDrive = useCallback(async () => {
    startTimeRef.current = Date.now();
    eventsRef.current = [];
    scoreRef.current = 100;
    scoreHistoryRef.current = [{ time: 0, score: 100 }];
    sensorDataRef.current = null;

    // Start event detection
    eventDetectionEngine.start((event: DetectedEvent) => {
      eventsRef.current = [...eventsRef.current, event];

      const result = scoringEngine.calculateIncrementalScore(
        scoreRef.current,
        event,
      );
      scoreRef.current = result.score;

      const elapsed = Date.now() - startTimeRef.current;
      scoreHistoryRef.current = [
        ...scoreHistoryRef.current,
        { time: elapsed, score: result.score },
      ];

      setState((prev) => ({
        ...prev,
        events: eventsRef.current,
        score: result.score,
        rating: result.rating,
        scoreHistory: scoreHistoryRef.current,
      }));
    });

    // Start sensor collection
    sensorService.start((snapshot: SensorSnapshot) => {
      sensorDataRef.current = snapshot;
      eventDetectionEngine.processSensorData(snapshot);

      // Throttle sensor UI updates
      setState((prev) => ({
        ...prev,
        sensorData: snapshot,
      }));
    });

    setState({
      status: 'active',
      elapsedMs: 0,
      score: 100,
      rating: 'Excellent',
      events: [],
      sensorData: null,
      scoreHistory: [{ time: 0, score: 100 }],
    });
  }, []);

  const stopDrive = useCallback((): DriveSession | null => {
    if (state.status !== 'active') return null;

    const endTime = Date.now();
    const duration = endTime - startTimeRef.current;

    // Stop everything
    sensorService.stop();
    eventDetectionEngine.stop();

    const finalResult = scoringEngine.calculateScore(eventsRef.current);

    const session: DriveSession = {
      id: `drive_${startTimeRef.current}`,
      startTime: startTimeRef.current,
      endTime,
      duration,
      score: finalResult.score,
      rating: finalResult.rating,
      events: eventsRef.current,
      totalEvents: eventsRef.current.length,
      distance: estimateDistance(duration),
      avgSpeed: estimateAvgSpeed(duration),
      scoreHistory: scoreHistoryRef.current,
    };

    setState((prev) => ({
      ...prev,
      status: 'completed',
    }));

    return session;
  }, [state.status]);

  const saveDrive = useCallback(async (session: DriveSession) => {
    await storageService.saveSession(session);
  }, []);

  const resetDrive = useCallback(() => {
    setState({
      status: 'idle',
      elapsedMs: 0,
      score: 100,
      rating: 'Excellent',
      events: [],
      sensorData: null,
      scoreHistory: [],
    });
  }, []);

  return {
    ...state,
    startDrive,
    stopDrive,
    saveDrive,
    resetDrive,
  };
}

// Simple distance estimation based on duration (assumes ~30 km/h average city driving)
function estimateDistance(durationMs: number): number {
  const hours = durationMs / (1000 * 60 * 60);
  return Math.round(hours * 30 * 10) / 10; // 30 km/h avg, 1 decimal
}

function estimateAvgSpeed(durationMs: number): number {
  if (durationMs < 1000) return 0;
  return 30 + Math.round(Math.random() * 20); // 30-50 km/h simulated
}
