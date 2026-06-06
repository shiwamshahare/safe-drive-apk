# SafeDrive — Driving Behavior Analysis App

> A React Native mobile app that uses device sensors to detect risky driving events in real-time and generate a driving safety score.

![Expo SDK](https://img.shields.io/badge/Expo_SDK-55-blue)
![React Native](https://img.shields.io/badge/React_Native-0.83-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-orange)

---

## 🔗 Links

| Resource | Link |
|----------|------|
| **GitHub Repository** | https://github.com/shiwamshahare/safe-drive-apk |
| **Demo Video** | [📹 Watch Demo](https://drive.google.com/file/d/1ie-K7xEHvuAFBN9wnqc1FIUMzlcm33Eq/view?usp=drivesdk) |

---

## Project Overview

SafeDrive monitors driving behavior in real-time using four built-in device sensors — Accelerometer, Gyroscope, Device Motion, and Magnetometer. The app detects six categories of risky driving events (harsh braking, harsh acceleration, sharp turns, aggressive steering, excessive movement, phone handling) and calculates a live driving safety score from 0–100.

### Key Features

- **Drive Sessions** — One-tap start/stop with confirmation modals and `expo-keep-awake` to prevent screen-off during drives
- **Real-Time Sensor Monitoring** — Live display of Accelerometer, Gyroscope, Device Motion, and Magnetometer values at 10 Hz
- **6-Type Event Detection** — Threshold-based detection with cooldown periods and low/medium/high severity classification
- **Live Score Updates** — Score decrements instantly whenever an event is detected; score timeline recorded throughout the drive
- **Drive Summary** — Post-drive screen with animated score ring, event breakdown chart, score-over-time line chart, and motivational message
- **Drive History** — Persistent storage of all past drives via AsyncStorage with filters (All / Best / Latest / Worst)
- **Drive Details** — Deep-dive into any historical drive with event timeline and charts
- **Onboarding Flow** — Splash screen → Permission request → Dashboard

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Expo SDK | 55.0.26 | App framework |
| React Native | 0.83.6 | UI framework |
| TypeScript | 5.9 | Static type safety |
| expo-sensors | ~55.0.15 | Accelerometer, Gyroscope, DeviceMotion, Magnetometer |
| expo-router | ~55.0.16 | File-based screen navigation |
| react-native-reanimated | 4.2.1 | Animated toast notifications |
| react-native-svg | 15.15.3 | Score ring gauge and score timeline chart |
| @react-native-async-storage/async-storage | 2.2.0 | Local session persistence |
| expo-haptics | ~55.0.14 | Haptic feedback on events |
| expo-keep-awake | ~55.0.8 | Prevent screen-off during active drives |
| @expo-google-fonts/poppins | ^0.4.1 | Typography |

---

## Sensors Used

| Sensor | API | What It Detects |
|--------|-----|-----------------|
| **Accelerometer** | `expo-sensors/Accelerometer` | Linear acceleration on X/Y/Z axes — used to detect braking and acceleration events |
| **Gyroscope** | `expo-sensors/Gyroscope` | Rotation rate on X/Y/Z axes — used to detect sharp turns and aggressive steering |
| **DeviceMotion** | `expo-sensors/DeviceMotion` | Combined acceleration + rotation (Euler angles + rotation rate) — used to detect excessive movement and phone handling |
| **Magnetometer** | `expo-sensors/Magnetometer` | Magnetic field / compass heading — displayed on the live sensor dashboard (optional, not scored) |

All sensors subscribe at a **100 ms update interval (10 Hz)** via `setUpdateInterval(100)`. This balances detection accuracy with battery consumption. Permissions for Device Motion (required on iOS) are requested before the first drive via `DeviceMotion.requestPermissionsAsync()`. On Android, sensors are auto-granted.

### Sensor Architecture

```
Device Sensors
      │
      ▼
SensorService (singleton)
  ├── Accelerometer.addListener()
  ├── Gyroscope.addListener()
  ├── DeviceMotion.addListener()
  └── Magnetometer.addListener()
      │
      ▼ SensorSnapshot (all 4 sensors bundled)
      │
      ▼
EventDetectionEngine.processSensorData()
      │
      ▼ DetectedEvent (type, severity, deduction, snapshot)
      │
      ▼
ScoringEngine.calculateIncrementalScore()
      │
      ▼
React State → UI update
```

---

## Event Detection Strategy

Each event uses a specific sensor axis and a threshold comparison. A **cooldown period** prevents the same event from triggering repeatedly for the same incident.

### Detection Table

| Event | Sensor | Logic | Threshold | Cooldown | Score Deduction |
|-------|--------|-------|-----------|----------|-----------------|
| **Harsh Braking** | Accelerometer Z-axis | Delta between consecutive Z readings; **negative** delta = deceleration | `Δz < −8.0 m/s²` | 3 s | **−5 pts** |
| **Harsh Acceleration** | Accelerometer Z-axis | Delta between consecutive Z readings; **positive** delta = acceleration | `Δz > 7.0 m/s²` | 3 s | **−5 pts** |
| **Sharp Turn** | Gyroscope Y-axis | Absolute yaw rotation rate | `|ωy| > 2.5 rad/s` | 2 s | **−3 pts** |
| **Aggressive Steering** | Gyroscope X + Y axes | Combined rotation magnitude | `√(ωx² + ωy²) > 3.0 rad/s` | 3 s | **−3 pts** |
| **Excessive Movement** | DeviceMotion acceleration | Acceleration magnitude **sustained** for 1 second | `√(ax² + ay² + az²) > 12.0 m/s²` for ≥ 1 s | 5 s | **−2 pts** |
| **Phone Handling** | DeviceMotion rotationRate | Combined delta across all rotation rate axes between consecutive readings | `√(Δα² + Δβ² + Δγ²) > 1.5 rad/s` | 10 s | **−10 pts** |

### Severity Classification

Each detected event is classified into a severity level based on how far the reading exceeds its threshold:

| Severity | Criterion |
|----------|-----------|
| **Low** | Reading just above threshold |
| **Medium** | 25–50% above threshold |
| **High** | 50%+ above threshold |

For example, harsh braking:
- Low: `|Δz|` between 8.0 and 10.0 m/s²
- Medium: `|Δz|` between 10.0 and 12.0 m/s²
- High: `|Δz|` > 12.0 m/s²

### Why These Thresholds?

- **Braking/Acceleration (8.0 / 7.0 m/s²)**: Normal driving produces acceleration changes well below 3–4 m/s². Emergency braking typically exceeds 8 m/s². The asymmetry (8 vs 7) reflects that braking tends to produce sharper delta spikes than acceleration from rest.
- **Sharp Turn (2.5 rad/s)**: A typical lane change at highway speed produces ~0.5–1.0 rad/s. Aggressive cornering exceeds 2.5 rad/s.
- **Aggressive Steering (3.0 rad/s combined)**: Higher composite threshold to avoid overlap with single-axis sharp turn.
- **Excessive Movement (12.0 m/s² for 1 s)**: Short spikes from road bumps are common; the 1-second sustain requirement filters out one-off bumps.
- **Phone Handling (1.5 rad/s delta, 10 s cooldown)**: Picking up or repositioning a phone produces abrupt rotation changes. The long cooldown (10 s) prevents accidental multiple detections from a single grab.

### Delta-Based Detection (Braking & Acceleration)

Rather than using raw accelerometer values (which include gravity), the engine computes the **delta** between consecutive Z-axis readings:

```typescript
const deltaZ = snapshot.accelerometer.z - this.prevAccelZ;
if (deltaZ < -THRESHOLDS.HARSH_BRAKING) { /* harsh braking */ }
if (deltaZ > THRESHOLDS.HARSH_ACCELERATION) { /* harsh acceleration */ }
```

This makes detection **mounting-position independent** — it doesn't matter whether the phone is flat or portrait; only the sudden *change* is measured.

---

## Driving Score Calculation

### Formula

```
Score = max(0, 100 − Σ(event_deductions))
```

- **Starting score**: 100
- **Minimum score**: 0 (score cannot go negative)
- Each detected event subtracts its deduction from the current score immediately

### Real-Time Incremental Updates

```typescript
// On every event detected:
const result = scoringEngine.calculateIncrementalScore(currentScore, newEvent);
// result.score = max(0, currentScore - event.deduction)
```

A `scoreHistory` array records `{ time: elapsed_ms, score }` on every event, allowing the score-over-time chart to be rendered in the summary screen.

### Safety Rating Tiers

| Score Range | Rating | Meaning |
|-------------|--------|---------|
| 90 – 100 | **Excellent** | Outstanding, safe driver |
| 75 – 89 | **Good** | Safe with minor issues |
| 50 – 74 | **Fair** | Room for improvement |
| 0 – 49 | **Poor** | Unsafe driving detected |

---

## Project Structure

```
src/
├── app/                          # Expo Router screens
│   ├── _layout.tsx               # Root layout (fonts, splash, stack navigation)
│   ├── index.tsx                 # Entry redirect → splash
│   ├── splash.tsx                # 2.5s animated splash screen
│   ├── permissions.tsx           # Sensor permission request screen
│   ├── summary.tsx               # Post-drive summary (score, events, timeline)
│   ├── drive-details.tsx         # Historical drive deep-dive
│   └── (tabs)/
│       ├── _layout.tsx           # Bottom tab bar configuration
│       ├── index.tsx             # Home dashboard (avg score, stats, last drive)
│       ├── drive.tsx             # Active drive recording screen
│       └── history.tsx           # Drive history list with filters
│
├── components/                   # Reusable UI components
│   ├── ScoreRing.tsx             # Animated circular score gauge (SVG)
│   ├── SensorCard.tsx            # Live sensor values display card
│   ├── EventBadge.tsx            # Detected event row with icon + severity
│   ├── StatCard.tsx              # Single metric display card
│   ├── DriveListItem.tsx         # History list row
│   ├── SafetyRatingBadge.tsx     # Rating pill (Excellent / Good / Fair / Poor)
│   ├── ConfirmModal.tsx          # Confirmation dialog (start/end drive)
│   ├── EmptyState.tsx            # No-data placeholder
│   ├── ErrorState.tsx            # Error placeholder
│   ├── EventBreakdownChart.tsx   # Bar chart of event counts per type
│   └── ScoreTimeline.tsx         # Score-over-time line chart (SVG)
│
├── services/                     # Core business logic (framework-independent)
│   ├── sensorService.ts          # Unified sensor manager (start/stop/availability)
│   ├── eventDetectionEngine.ts   # Threshold-based event detection with cooldowns
│   ├── scoringEngine.ts          # Score calculation, rating, motivational messages
│   └── storageService.ts         # AsyncStorage read/write/delete for sessions
│
├── hooks/                        # React hooks
│   ├── useFonts.ts               # Poppins font loading via expo-font
│   ├── useTheme.ts               # Dark theme access
│   ├── useSensors.ts             # Standalone sensor hook (availability check)
│   ├── useDriveSession.ts        # Full drive lifecycle: start → record → stop → save
│   └── useDriveHistory.ts        # Load, filter, and delete stored sessions
│
├── theme/
│   ├── colors.ts                 # Dark "Midnight Obsidian" palette with named tokens
│   └── fonts.ts                  # Poppins font family presets
│
└── types/
    └── index.ts                  # All TypeScript interfaces + THRESHOLDS + EVENT_META
```

---

## How to Run Locally

### Prerequisites

- Node.js 18+
- Bun (`npm install -g bun`) or npm
- Expo Go app installed on your Android/iOS device **or** an Android emulator with Play Services

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/shiwamshahare/safe-drive-apk.git
cd safe-drive-apk

# 2. Install dependencies
bun install
# or: npm install

# 3. Start the Expo development server
npx expo start

# 4. Scan the QR code with Expo Go (Android/iOS)
#    or press 'a' to open on a connected Android device/emulator
```

> ⚠️ **Sensors do not work in a web browser or iOS simulator.** Use a physical Android/iOS device for full sensor functionality.

### Build APK (Optional)

```bash
# Install EAS CLI
npm install -g eas-cli

# Build Android APK
eas build --platform android --profile preview
```

---

## Assumptions

1. **Phone mounting**: The phone is assumed to be mounted on the dashboard or windshield in portrait orientation. Thresholds are calibrated for a mounted position; hand-held use may produce false positives.

2. **Sensor availability**: Accelerometer and Gyroscope are assumed available on all modern smartphones (manufactured after 2015). The Magnetometer is treated as optional and does not affect the score.

3. **Distance estimation**: GPS is not used. Distance is estimated as `(duration_hours × 30 km/h)` assuming an average city driving speed of 30 km/h. This is a simplification documented in the UI.

4. **Offline-first**: All drive session data is stored locally on-device via AsyncStorage. There is no backend or cloud sync.

5. **Android-first**: The primary deployment target is Android APK. iOS motion permission is handled via `DeviceMotion.requestPermissionsAsync()` but iOS is a secondary target.

6. **Single sensor orientation**: The detection logic assumes the Z-axis of the accelerometer aligns with the forward/backward axis of the vehicle (typical for dashboard-mounted portrait phones). Detection uses delta values rather than absolute values to partially compensate for different orientations.

7. **10 Hz sampling**: Sensors update every 100 ms. This is sufficient to detect events lasting 200 ms or more (typical braking events last 500 ms–2 s). Very short-duration micro-events may be missed.

---

## Screenshots

<img width="270" height="600" alt="Splash Screen" src="https://github.com/user-attachments/assets/705c27ee-73ef-404a-9453-72ea40c52ea3" />
<img width="270" height="600" alt="Permissions Screen" src="https://github.com/user-attachments/assets/2547cf7b-5edb-462d-933e-d6f2c8aed980" />
<img width="270" height="600" alt="Home Dashboard" src="https://github.com/user-attachments/assets/ff1dd652-1d8b-44ba-a2f3-dd1acb0b3442" />
<img width="270" height="600" alt="Active Drive" src="https://github.com/user-attachments/assets/31f97471-2dad-4402-b986-5ba2bcb17682" />
<img width="270" height="600" alt="Live Sensor Data" src="https://github.com/user-attachments/assets/549a95c9-79b8-40de-8b7d-0bf320678241" />
<img width="270" height="600" alt="Drive Summary" src="https://github.com/user-attachments/assets/edaa8e84-dce1-44c1-ba7e-54742f1d84ed" />
<img width="270" height="600" alt="Event Breakdown" src="https://github.com/user-attachments/assets/0a3097cb-793e-4069-beb2-d5ed0b4aff98" />
<img width="270" height="600" alt="Drive History" src="https://github.com/user-attachments/assets/ff20f2a5-f55a-40cc-b382-e6ba4556421d" />
<img width="270" height="600" alt="Drive Details" src="https://github.com/user-attachments/assets/f9fda2ef-ee1b-4522-9ba8-4e1f249d5bb9" />

---

## License

MIT
