/**
 * SafeDrive — Shared TypeScript Types
 */

// ─── Sensor Data ─────────────────────────────────────────────
export interface AccelerometerData {
  x: number;
  y: number;
  z: number;
}

export interface GyroscopeData {
  x: number;
  y: number;
  z: number;
}

export interface DeviceMotionData {
  acceleration: { x: number; y: number; z: number } | null;
  accelerationIncludingGravity: { x: number; y: number; z: number } | null;
  rotation: { alpha: number; beta: number; gamma: number } | null;
  rotationRate: { alpha: number; beta: number; gamma: number } | null;
}

export interface MagnetometerData {
  x: number;
  y: number;
  z: number;
}

export interface SensorSnapshot {
  accelerometer: AccelerometerData | null;
  gyroscope: GyroscopeData | null;
  deviceMotion: DeviceMotionData | null;
  magnetometer: MagnetometerData | null;
  timestamp: number;
}

// ─── Events ──────────────────────────────────────────────────
export type DrivingEventType =
  | 'harsh_braking'
  | 'harsh_acceleration'
  | 'sharp_turn'
  | 'aggressive_steering'
  | 'excessive_movement'
  | 'phone_handling';

export interface DetectedEvent {
  id: string;
  type: DrivingEventType;
  timestamp: number;
  severity: 'low' | 'medium' | 'high';
  deduction: number;
  sensorSnapshot: SensorSnapshot;
}

import { theme } from '@/theme/colors';

// ─── Event Display Metadata ──────────────────────────────────
export type IconFamily = 'Ionicons' | 'MaterialCommunityIcons';

export const EVENT_META: Record<DrivingEventType, {
  label: string;
  icon: string;
  iconFamily: IconFamily;
  color: string;
  deduction: number;
}> = {
  harsh_braking: {
    label: 'Harsh Brake',
    icon: 'hand-left',
    iconFamily: 'Ionicons',
    get color() { return theme.red; },
    deduction: 5,
  },
  harsh_acceleration: {
    label: 'Harsh Acceleration',
    icon: 'flash',
    iconFamily: 'Ionicons',
    get color() { return theme.accentOrange; },
    deduction: 5,
  },
  sharp_turn: {
    label: 'Sharp Turn',
    icon: 'return-down-forward',
    iconFamily: 'Ionicons',
    get color() { return theme.primary; },
    deduction: 3,
  },
  aggressive_steering: {
    label: 'Aggressive Steering',
    icon: 'steering',
    iconFamily: 'MaterialCommunityIcons',
    get color() { return theme.accentPurple; },
    deduction: 3,
  },
  excessive_movement: {
    label: 'Excessive Movement',
    icon: 'swap-horizontal',
    iconFamily: 'Ionicons',
    get color() { return theme.green; },
    deduction: 2,
  },
  phone_handling: {
    label: 'Phone Handling',
    icon: 'phone-portrait',
    iconFamily: 'Ionicons',
    get color() { return theme.accentCoral; },
    deduction: 10,
  },
};


// ─── Scoring ─────────────────────────────────────────────────
export type SafetyRating = 'Excellent' | 'Good' | 'Fair' | 'Poor';

export interface ScoreResult {
  score: number;
  rating: SafetyRating;
  totalDeductions: number;
}

// ─── Drive Session ───────────────────────────────────────────
export type DriveStatus = 'idle' | 'active' | 'paused' | 'completed';

export interface DriveSession {
  id: string;
  startTime: number;
  endTime: number;
  duration: number; // milliseconds
  score: number;
  rating: SafetyRating;
  events: DetectedEvent[];
  totalEvents: number;
  distance: number; // km (estimated)
  avgSpeed: number; // km/h (estimated)
  scoreHistory: { time: number; score: number }[];
}

// ─── Sensor Thresholds (documented) ──────────────────────────
export const THRESHOLDS = {
  /** Accelerometer Z-axis deceleration threshold (m/s²) */
  HARSH_BRAKING: 8.0,
  /** Accelerometer Z-axis acceleration threshold (m/s²) */
  HARSH_ACCELERATION: 7.0,
  /** Gyroscope Y-axis rotation threshold (rad/s) */
  SHARP_TURN: 2.5,
  /** Gyroscope combined X+Y rotation threshold (rad/s) */
  AGGRESSIVE_STEERING: 3.0,
  /** DeviceMotion acceleration magnitude threshold (m/s²) */
  EXCESSIVE_MOVEMENT: 12.0,
  /** DeviceMotion rotation rate change threshold (rad/s) */
  PHONE_HANDLING: 1.5,
  /** Duration for excessive movement sustain (ms) */
  EXCESSIVE_MOVEMENT_DURATION: 1000,
  /** Cooldown periods per event type (ms) */
  COOLDOWNS: {
    harsh_braking: 3000,
    harsh_acceleration: 3000,
    sharp_turn: 2000,
    aggressive_steering: 3000,
    excessive_movement: 5000,
    phone_handling: 10000,
  },
  /** Sensor update interval (ms) */
  UPDATE_INTERVAL: 100,
} as const;
