/**
 * useSensors — Real-time sensor data hook
 *
 * Provides live sensor readings as React state.
 * Automatically subscribes/unsubscribes on mount/unmount.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { sensorService } from '@/services/sensorService';
import type { SensorSnapshot } from '@/types';

export function useSensors(active: boolean = false) {
  const [data, setData] = useState<SensorSnapshot | null>(null);
  const [isAvailable, setIsAvailable] = useState({
    accelerometer: false,
    gyroscope: false,
    deviceMotion: false,
    magnetometer: false,
  });
  const throttleRef = useRef<number>(0);

  useEffect(() => {
    sensorService.checkAvailability().then(setIsAvailable);
  }, []);

  useEffect(() => {
    if (!active) {
      if (sensorService.running) {
        sensorService.stop();
      }
      return;
    }

    sensorService.start((snapshot) => {
      // Throttle UI updates to ~10fps to avoid excessive re-renders
      const now = Date.now();
      if (now - throttleRef.current > 100) {
        throttleRef.current = now;
        setData(snapshot);
      }
    });

    return () => {
      sensorService.stop();
    };
  }, [active]);

  const requestPermissions = useCallback(async () => {
    return sensorService.requestPermissions();
  }, []);

  return {
    data,
    isAvailable,
    requestPermissions,
    isRunning: active && sensorService.running,
  };
}
