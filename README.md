# SafeDrive — Driving Behavior Analysis App

> A mobile application that uses device sensors to analyze driving behavior and generate a driving safety score.

![Expo SDK](https://img.shields.io/badge/Expo_SDK-55-blue)
![React Native](https://img.shields.io/badge/React_Native-0.83-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-orange)

## Project Overview

SafeDrive monitors driving behavior in real-time using device sensors (Accelerometer, Gyroscope, Device Motion, and Magnetometer). It detects risky driving events like harsh braking, sharp turns, and phone handling, then calculates a driving safety score from 0-100 with detailed analytics.

### Key Features

- **Start/End Drive** — One-tap session management with confirmation modals
- **Real-time Sensor Monitoring** — Live Accelerometer, Gyroscope, Device Motion, Magnetometer data
- **Event Detection** — 6 types of risky driving events detected in real-time
- **Driving Score** — Score starts at 100, deductions for each event
- **Drive Summary** — Post-drive analytics with score ring, event breakdown, score timeline
- **Drive History** — Browse past drives with filtering (All/Best/Latest/Worst)
- **Drive Details** — Deep-dive into any past drive with event timeline and charts

## Demo Video
**📹[Demo Video Link](https://drive.google.com/file/d/1ie-K7xEHvuAFBN9wnqc1FIUMzlcm33Eq/view?usp=drivesdk)**

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Expo SDK | 55.0.0 | Framework |
| React Native | 0.83.6 | UI Framework |
| TypeScript | 5.9 | Type Safety |
| expo-sensors | 55.x | Accelerometer, Gyroscope, DeviceMotion, Magnetometer |
| expo-router | 55.x | File-based routing |
| react-native-reanimated | 4.2.1 | Score ring animation |
| react-native-svg | 15.x | Score ring, timeline charts |
| @react-native-async-storage/async-storage | 2.2.0 | Session persistence |
| expo-haptics | 55.x | Haptic feedback |
| expo-keep-awake | 55.x | Screen-on during drives |
| @expo-google-fonts/poppins | 0.4.x | Typography |

## Sensors Used

| Sensor | API | Purpose |
|--------|-----|---------|
| **Accelerometer** | `expo-sensors/Accelerometer` | Detect harsh braking & acceleration (x/y/z linear acceleration) |
| **Gyroscope** | `expo-sensors/Gyroscope` | Detect sharp turns & aggressive steering (x/y/z rotation rate) |
| **Device Motion** | `expo-sensors/DeviceMotion` | Detect excessive movement & phone handling (combined motion + rotation) |
| **Magnetometer** | `expo-sensors/Magnetometer` | Compass heading display (optional, not scored) |

All sensors update at **100ms intervals** (10 Hz) for battery efficiency.

## Event Detection Strategy

Each event type uses specific sensor data and threshold-based detection with cooldown periods to prevent duplicate detections.

| Event | Sensor | Detection Logic | Threshold | Cooldown | Deduction |
|-------|--------|-----------------|-----------|----------|-----------|
| **Harsh Braking** | Accelerometer Z-axis | Delta between consecutive Z readings (negative = deceleration) | `\|Δa\| > 8.0 m/s²` | 3s | **-5** |
| **Harsh Acceleration** | Accelerometer Z-axis | Delta between consecutive Z readings (positive = acceleration) | `\|Δa\| > 7.0 m/s²` | 3s | **-5** |
| **Sharp Turn** | Gyroscope Y-axis | Absolute rotation rate on yaw axis | `\|ω\| > 2.5 rad/s` | 2s | **-3** |
| **Aggressive Steering** | Gyroscope X+Y axes | Combined rotation magnitude | `√(ωx² + ωy²) > 3.0 rad/s` | 3s | **-3** |
| **Excessive Movement** | DeviceMotion acceleration | Acceleration magnitude sustained for 1 second | `√(ax² + ay² + az²) > 12.0 m/s²` for 1s | 5s | **-2** |
| **Phone Handling** | DeviceMotion rotation rate | Delta in rotation rate across all axes | `Δrotation > 1.5 rad/s` combined | 10s | **-10** |

### Severity Levels

Each detected event is assigned a severity (low/medium/high) based on how far the sensor reading exceeds the threshold:
- **Low** — Just above threshold
- **Medium** — 25-50% above threshold
- **High** — 50%+ above threshold

## Driving Score Calculation

```
Score = max(0, 100 - Σ(event_deductions))
```

- **Starting score**: 100
- **Minimum score**: 0
- **Deductions**: Applied per detected event (see table above)

<!-- ### Safety Rating Tiers

| Score Range | Rating | Color |
|-------------|--------|-------|
| 90 – 100 | Excellent | Green (#3FB950) |
| 75 – 89 | Good | Steel Blue (#58A6FF) |
| 50 – 74 | Fair | Amber (#D29922) |
| 0 – 49 | Poor | Red (#F85149) | -->

### Safety Rating Tiers

| Score Range | Rating |
|-------------|--------|
| 90 – 100 | Excellent |
| 75 – 89 | Good |
| 50 – 74 | Fair |
| 0 – 49 | Poor |

## How to Run Locally

### Prerequisites

- Node.js 18+
- Bun (or npm/yarn)
- Expo CLI (`npx expo`)
- Android device or emulator (sensors don't work on web)

### Setup

```bash
# Clone the repo
git clone https://github.com/shiwamshahare/safe-drive-apk.git
cd safe-drive-apk

# Install dependencies
bun install
# or: npm install

# Start Expo dev server
npx expo start

# Run on Android device
npx expo start --android
```

<!-- ### Building APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure build
eas build:configure

# Build APK (Android)
eas build --platform android --profile preview

# Or build locally (requires Android SDK)
npx expo run:android
``` -->

<!-- ## Project Architecture

```
src/
├── app/                         # Expo Router screens
│   ├── _layout.tsx              # Root layout (fonts, splash, stack)
│   ├── index.tsx                # Initial redirect → splash
│   ├── splash.tsx               # Splash screen (2.5s)
│   ├── permissions.tsx          # Sensor permission request
│   ├── summary.tsx              # Post-drive summary
│   ├── drive-details.tsx        # Historical drive details
│   └── (tabs)/                  # Bottom tab navigator
│       ├── _layout.tsx          # Tab bar configuration
│       ├── index.tsx            # Home dashboard
│       ├── drive.tsx            # Active drive recording
│       └── history.tsx          # Drive history list
├── components/                  # Reusable UI components
│   ├── ScoreRing.tsx            # Animated circular score gauge
│   ├── SensorCard.tsx           # Live sensor data display
│   ├── EventBadge.tsx           # Event notification badge
│   ├── StatCard.tsx             # Stat metric display
│   ├── DriveListItem.tsx        # History list row
│   ├── SafetyRatingBadge.tsx    # Rating pill badge
│   ├── ConfirmModal.tsx         # Confirmation dialog
│   ├── EmptyState.tsx           # No data placeholder
│   ├── ErrorState.tsx           # Error placeholder
│   ├── EventBreakdownChart.tsx  # Event counts chart
│   └── ScoreTimeline.tsx        # Score-over-time line chart
├── services/                    # Core business logic
│   ├── sensorService.ts         # Unified sensor manager
│   ├── eventDetectionEngine.ts  # Threshold-based event detection
│   ├── scoringEngine.ts         # Score calculation
│   └── storageService.ts        # AsyncStorage persistence
├── hooks/                       # React hooks
│   ├── useFonts.ts              # Poppins font loading
│   ├── useTheme.ts              # Dark theme provider
│   ├── useSensors.ts            # Real-time sensor data
│   ├── useDriveSession.ts       # Drive lifecycle management
│   └── useDriveHistory.ts       # Stored sessions management
├── theme/                       # Design tokens
│   ├── colors.ts                # Dark palette with peach accents
│   └── fonts.ts                 # Poppins font presets
└── types/
    └── index.ts                 # Shared TypeScript types & thresholds
``` -->

## Assumptions

1. **Phone mounting**: The phone is assumed to be mounted on the dashboard or held relatively still during normal driving. Thresholds are calibrated for this position.
2. **Sensor availability**: Accelerometer and Gyroscope are assumed available on all modern smartphones. Magnetometer is optional.
3. **Distance estimation**: Distance is estimated based on duration and average city driving speed (~30 km/h), not GPS. GPS integration would require `expo-location`.
4. **Offline-first**: All data is stored locally via AsyncStorage. No backend/cloud sync.
5. **Android focus**: The primary target is Android APK. iOS requires motion permission which is handled but not the primary deployment target.
6. **Battery**: Sensor update interval is 100ms (10 Hz) to balance between detection accuracy and battery efficiency.

<!-- ## Design System

- **Theme**: "Midnight Obsidian" — Dark-only (#0D1117 background)
- **Accent**: Steel Blue (#58A6FF, #79C0FF)
- **Typography**: Poppins (Regular, Medium, SemiBold, Bold)
- **Border Radius**: 12-20px for cards, 14-16px for buttons
- **Spacing**: 8px base grid
- **Cards**: Subtle 1px borders (#21262D) for depth -->

## Screenshots
<img  width="270" height="600" alt="1" src="https://github.com/user-attachments/assets/705c27ee-73ef-404a-9453-72ea40c52ea3" />
<img  width="270" height="600" alt="2" src="https://github.com/user-attachments/assets/2547cf7b-5edb-462d-933e-d6f2c8aed980" />
<img  width="270" height="600" alt="3" src="https://github.com/user-attachments/assets/ff1dd652-1d8b-44ba-a2f3-dd1acb0b3442" />
<img  width="270" height="600" alt="4" src="https://github.com/user-attachments/assets/31f97471-2dad-4402-b986-5ba2bcb17682" />
<img  width="270" height="600" alt="5" src="https://github.com/user-attachments/assets/549a95c9-79b8-40de-8b7d-0bf320678241" />
<img  width="270" height="600" alt="6" src="https://github.com/user-attachments/assets/edaa8e84-dce1-44c1-ba7e-54742f1d84ed" />
<img  width="270" height="600" alt="7" src="https://github.com/user-attachments/assets/0a3097cb-793e-4069-beb2-d5ed0b4aff98" />
<img  width="270" height="600" alt="8" src="https://github.com/user-attachments/assets/ff20f2a5-f55a-40cc-b382-e6ba4556421d" />
<img  width="270" height="600" alt="9" src="https://github.com/user-attachments/assets/f9fda2ef-ee1b-4522-9ba8-4e1f249d5bb9" />

<!-- 
| Splash | Permissions | Home Dashboard |
|--------|-------------|----------------|
| Dark screen with shield logo | Sensor access cards | Score ring + stats |

| Active Drive | Drive Summary | Drive History |
|-------------|---------------|---------------|
| Timer + live sensors | Score + event breakdown | Filterable list | -->

## License

MIT
