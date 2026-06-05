/**
 * SensorService — Unified sensor manager for SafeDrive
 *
 * Subscribes to Accelerometer, Gyroscope, DeviceMotion, and Magnetometer.
 * Provides a single callback stream of normalized sensor data.
 * Manages subscription lifecycle (start/stop) and update intervals.
 */
import {
  Accelerometer,
  Gyroscope,
  DeviceMotion,
  Magnetometer,
} from 'expo-sensors';
import type {
  AccelerometerData,
  GyroscopeData,
  DeviceMotionData,
  MagnetometerData,
  SensorSnapshot,
} from '@/types';
import { THRESHOLDS } from '@/types';

export type SensorCallback = (data: SensorSnapshot) => void;

class SensorService {
  private accelSubscription: ReturnType<typeof Accelerometer.addListener> | null = null;
  private gyroSubscription: ReturnType<typeof Gyroscope.addListener> | null = null;
  private motionSubscription: ReturnType<typeof DeviceMotion.addListener> | null = null;
  private magnetSubscription: ReturnType<typeof Magnetometer.addListener> | null = null;

  private latestAccel: AccelerometerData | null = null;
  private latestGyro: GyroscopeData | null = null;
  private latestMotion: DeviceMotionData | null = null;
  private latestMagnet: MagnetometerData | null = null;

  private callback: SensorCallback | null = null;
  private isRunning = false;

  /**
   * Check if required sensors are available on the device.
   */
  async checkAvailability(): Promise<{
    accelerometer: boolean;
    gyroscope: boolean;
    deviceMotion: boolean;
    magnetometer: boolean;
  }> {
    const [accel, gyro, motion, magnet] = await Promise.all([
      Accelerometer.isAvailableAsync(),
      Gyroscope.isAvailableAsync(),
      DeviceMotion.isAvailableAsync(),
      Magnetometer.isAvailableAsync(),
    ]);
    return {
      accelerometer: accel,
      gyroscope: gyro,
      deviceMotion: motion,
      magnetometer: magnet,
    };
  }

  /**
   * Request permission for motion sensors (iOS only, Android auto-grants).
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await DeviceMotion.requestPermissionsAsync();
      return status === 'granted';
    } catch {
      // Android doesn't require permissions for sensors
      return true;
    }
  }

  /**
   * Start all sensor subscriptions and begin streaming data.
   */
  start(callback: SensorCallback): void {
    if (this.isRunning) return;
    this.callback = callback;
    this.isRunning = true;

    const interval = THRESHOLDS.UPDATE_INTERVAL;

    // Set update intervals
    Accelerometer.setUpdateInterval(interval);
    Gyroscope.setUpdateInterval(interval);
    DeviceMotion.setUpdateInterval(interval);
    Magnetometer.setUpdateInterval(interval);

    // Subscribe to accelerometer
    this.accelSubscription = Accelerometer.addListener((data) => {
      this.latestAccel = data;
      this.emitSnapshot();
    });

    // Subscribe to gyroscope
    this.gyroSubscription = Gyroscope.addListener((data) => {
      this.latestGyro = data;
      this.emitSnapshot();
    });

    // Subscribe to device motion
    this.motionSubscription = DeviceMotion.addListener((data) => {
      this.latestMotion = {
        acceleration: data.acceleration ?? null,
        accelerationIncludingGravity: data.accelerationIncludingGravity ?? null,
        rotation: data.rotation
          ? { alpha: data.rotation.alpha, beta: data.rotation.beta, gamma: data.rotation.gamma }
          : null,
        rotationRate: data.rotationRate
          ? { alpha: data.rotationRate.alpha, beta: data.rotationRate.beta, gamma: data.rotationRate.gamma }
          : null,
      };
      this.emitSnapshot();
    });

    // Subscribe to magnetometer (optional — may not be available)
    try {
      this.magnetSubscription = Magnetometer.addListener((data) => {
        this.latestMagnet = data;
      });
    } catch {
      // Magnetometer not available — that's OK
      this.latestMagnet = null;
    }
  }

  /**
   * Stop all sensor subscriptions.
   */
  stop(): void {
    this.isRunning = false;
    this.callback = null;

    this.accelSubscription?.remove();
    this.gyroSubscription?.remove();
    this.motionSubscription?.remove();
    this.magnetSubscription?.remove();

    this.accelSubscription = null;
    this.gyroSubscription = null;
    this.motionSubscription = null;
    this.magnetSubscription = null;

    this.latestAccel = null;
    this.latestGyro = null;
    this.latestMotion = null;
    this.latestMagnet = null;
  }

  /**
   * Get latest sensor snapshot without subscribing.
   */
  getLatestSnapshot(): SensorSnapshot {
    return {
      accelerometer: this.latestAccel,
      gyroscope: this.latestGyro,
      deviceMotion: this.latestMotion,
      magnetometer: this.latestMagnet,
      timestamp: Date.now(),
    };
  }

  get running(): boolean {
    return this.isRunning;
  }

  private emitSnapshot(): void {
    if (!this.callback || !this.isRunning) return;
    this.callback({
      accelerometer: this.latestAccel,
      gyroscope: this.latestGyro,
      deviceMotion: this.latestMotion,
      magnetometer: this.latestMagnet,
      timestamp: Date.now(),
    });
  }
}

// Export singleton instance
export const sensorService = new SensorService();
