/**
 * EventDetectionEngine — Threshold-based driving event detection
 *
 * Analyzes sensor snapshots in real-time to detect driving events:
 * - Harsh Braking: |Δa| > 8 m/s² on accelerometer Z-axis
 * - Harsh Acceleration: |Δa| > 7 m/s² on accelerometer Z-axis
 * - Sharp Turn: |ω| > 2.5 rad/s on gyroscope Y-axis
 * - Aggressive Steering: √(ωx² + ωy²) > 3.0 rad/s combined gyroscope
 * - Excessive Movement: √(ax² + ay² + az²) > 12 m/s² sustained 1s
 * - Phone Handling: Δrotation > 1.5 rad/s across all axes
 *
 * Each event has a cooldown to prevent duplicate detections.
 */
import type {
  SensorSnapshot,
  DetectedEvent,
  DrivingEventType,
} from '@/types';
import { THRESHOLDS, EVENT_META } from '@/types';

export type EventCallback = (event: DetectedEvent) => void;

class EventDetectionEngine {
  private callback: EventCallback | null = null;
  private lastEventTimes: Record<DrivingEventType, number> = {
    harsh_braking: 0,
    harsh_acceleration: 0,
    sharp_turn: 0,
    aggressive_steering: 0,
    excessive_movement: 0,
    phone_handling: 0,
  };

  // Previous values for delta calculations
  private prevAccelZ: number | null = null;
  private prevRotationRate: { alpha: number; beta: number; gamma: number } | null = null;

  // Excessive movement tracking
  private excessiveMovementStart: number | null = null;

  private eventCounter = 0;

  /**
   * Start listening for events with a callback.
   */
  start(callback: EventCallback): void {
    this.callback = callback;
    this.reset();
  }

  /**
   * Stop event detection.
   */
  stop(): void {
    this.callback = null;
    this.reset();
  }

  /**
   * Reset internal state.
   */
  reset(): void {
    this.prevAccelZ = null;
    this.prevRotationRate = null;
    this.excessiveMovementStart = null;
    this.eventCounter = 0;
    Object.keys(this.lastEventTimes).forEach((key) => {
      this.lastEventTimes[key as DrivingEventType] = 0;
    });
  }

  /**
   * Process a sensor snapshot and detect events.
   * Call this on every sensor update from SensorService.
   */
  processSensorData(snapshot: SensorSnapshot): void {
    if (!this.callback) return;

    const now = snapshot.timestamp;

    this.detectHarshBraking(snapshot, now);
    this.detectHarshAcceleration(snapshot, now);
    this.detectSharpTurn(snapshot, now);
    this.detectAggressiveSteering(snapshot, now);
    this.detectExcessiveMovement(snapshot, now);
    this.detectPhoneHandling(snapshot, now);

    // Update previous values
    if (snapshot.accelerometer) {
      this.prevAccelZ = snapshot.accelerometer.z;
    }
    if (snapshot.deviceMotion?.rotationRate) {
      this.prevRotationRate = { ...snapshot.deviceMotion.rotationRate };
    }
  }

  private canEmit(type: DrivingEventType, now: number): boolean {
    const cooldown = THRESHOLDS.COOLDOWNS[type];
    return now - this.lastEventTimes[type] > cooldown;
  }

  private emitEvent(
    type: DrivingEventType,
    snapshot: SensorSnapshot,
    now: number,
    severity: 'low' | 'medium' | 'high' = 'medium',
  ): void {
    if (!this.callback || !this.canEmit(type, now)) return;

    this.lastEventTimes[type] = now;
    this.eventCounter++;

    const event: DetectedEvent = {
      id: `evt_${now}_${this.eventCounter}`,
      type,
      timestamp: now,
      severity,
      deduction: EVENT_META[type].deduction,
      sensorSnapshot: snapshot,
    };

    this.callback(event);
  }

  /**
   * Harsh Braking: Sudden deceleration on the Z-axis (forward axis when phone is mounted)
   * Threshold: |Δa| > 8 m/s² between consecutive readings
   */
  private detectHarshBraking(snapshot: SensorSnapshot, now: number): void {
    if (!snapshot.accelerometer || this.prevAccelZ === null) return;

    const deltaZ = snapshot.accelerometer.z - this.prevAccelZ;
    // Negative delta = deceleration (braking)
    if (deltaZ < -THRESHOLDS.HARSH_BRAKING) {
      const severity = Math.abs(deltaZ) > 12 ? 'high' : Math.abs(deltaZ) > 10 ? 'medium' : 'low';
      this.emitEvent('harsh_braking', snapshot, now, severity);
    }
  }

  /**
   * Harsh Acceleration: Sudden acceleration on the Z-axis
   * Threshold: |Δa| > 7 m/s² between consecutive readings
   */
  private detectHarshAcceleration(snapshot: SensorSnapshot, now: number): void {
    if (!snapshot.accelerometer || this.prevAccelZ === null) return;

    const deltaZ = snapshot.accelerometer.z - this.prevAccelZ;
    // Positive delta = acceleration
    if (deltaZ > THRESHOLDS.HARSH_ACCELERATION) {
      const severity = deltaZ > 11 ? 'high' : deltaZ > 9 ? 'medium' : 'low';
      this.emitEvent('harsh_acceleration', snapshot, now, severity);
    }
  }

  /**
   * Sharp Turn: High rotation rate on Y-axis (yaw when phone is flat)
   * Threshold: |ω| > 2.5 rad/s
   */
  private detectSharpTurn(snapshot: SensorSnapshot, now: number): void {
    if (!snapshot.gyroscope) return;

    const rotY = Math.abs(snapshot.gyroscope.y);
    if (rotY > THRESHOLDS.SHARP_TURN) {
      const severity = rotY > 4.0 ? 'high' : rotY > 3.0 ? 'medium' : 'low';
      this.emitEvent('sharp_turn', snapshot, now, severity);
    }
  }

  /**
   * Aggressive Steering: Combined rotation on X and Y axes
   * Threshold: √(ωx² + ωy²) > 3.0 rad/s
   */
  private detectAggressiveSteering(snapshot: SensorSnapshot, now: number): void {
    if (!snapshot.gyroscope) return;

    const combined = Math.sqrt(
      snapshot.gyroscope.x ** 2 + snapshot.gyroscope.y ** 2,
    );
    if (combined > THRESHOLDS.AGGRESSIVE_STEERING) {
      const severity = combined > 5.0 ? 'high' : combined > 4.0 ? 'medium' : 'low';
      this.emitEvent('aggressive_steering', snapshot, now, severity);
    }
  }

  /**
   * Excessive Movement: High acceleration magnitude sustained for 1 second
   * Threshold: √(ax² + ay² + az²) > 12 m/s² sustained 1s
   */
  private detectExcessiveMovement(snapshot: SensorSnapshot, now: number): void {
    const accel = snapshot.deviceMotion?.acceleration ?? snapshot.accelerometer;
    if (!accel) return;

    const magnitude = Math.sqrt(accel.x ** 2 + accel.y ** 2 + accel.z ** 2);

    if (magnitude > THRESHOLDS.EXCESSIVE_MOVEMENT) {
      if (this.excessiveMovementStart === null) {
        this.excessiveMovementStart = now;
      } else if (now - this.excessiveMovementStart > THRESHOLDS.EXCESSIVE_MOVEMENT_DURATION) {
        this.emitEvent('excessive_movement', snapshot, now, 'medium');
        this.excessiveMovementStart = null; // reset after emitting
      }
    } else {
      this.excessiveMovementStart = null;
    }
  }

  /**
   * Phone Handling: Sudden change in rotation rate across all axes
   * Threshold: Δrotation > 1.5 rad/s combined
   */
  private detectPhoneHandling(snapshot: SensorSnapshot, now: number): void {
    if (!snapshot.deviceMotion?.rotationRate || !this.prevRotationRate) return;

    const curr = snapshot.deviceMotion.rotationRate;
    const prev = this.prevRotationRate;

    const deltaAlpha = Math.abs(curr.alpha - prev.alpha);
    const deltaBeta = Math.abs(curr.beta - prev.beta);
    const deltaGamma = Math.abs(curr.gamma - prev.gamma);

    const combinedDelta = Math.sqrt(
      deltaAlpha ** 2 + deltaBeta ** 2 + deltaGamma ** 2,
    );

    if (combinedDelta > THRESHOLDS.PHONE_HANDLING) {
      this.emitEvent('phone_handling', snapshot, now, 'high');
    }
  }
}

export const eventDetectionEngine = new EventDetectionEngine();
