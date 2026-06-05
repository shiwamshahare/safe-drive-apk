import { ConfirmModal } from '@/components/ConfirmModal';
import { EventBadge } from '@/components/EventBadge';
import { ScoreRing } from '@/components/ScoreRing';
import { SensorCard } from '@/components/SensorCard';
import { StatCard } from '@/components/StatCard';
import { useDriveSession } from '@/hooks/useDriveSession';
import { theme } from '@/theme/colors';
import { FontFamily } from '@/theme/fonts';
import { EVENT_META, type DriveSession } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DriveScreen() {
  const session = useDriveSession();
  const insets = useSafeAreaInsets();
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const completedSessionRef = useRef<DriveSession | null>(null);

  const [activeToast, setActiveToast] = useState<{
    id: string;
    label: string;
    deduction: number;
    color: string;
  } | null>(null);

  const prevEventsLengthRef = useRef(0);
  const toastY = useSharedValue(-100);
  const toastOpacity = useSharedValue(0);

  useEffect(() => {
    if (session.status === 'active') {
      const currentLength = session.events.length;
      if (currentLength > prevEventsLengthRef.current) {
        const latestEvent = session.events[currentLength - 1];
        if (latestEvent) {
          const meta = EVENT_META[latestEvent.type];
          setActiveToast({
            id: latestEvent.id,
            label: meta.label,
            deduction: latestEvent.deduction,
            color: meta.color,
          });
        }
      }
      prevEventsLengthRef.current = currentLength;
    } else {
      prevEventsLengthRef.current = 0;
      setActiveToast(null);
    }
  }, [session.events, session.status]);

  useEffect(() => {
    if (activeToast) {
      toastY.value = -100;
      toastOpacity.value = 0;

      toastY.value = withTiming(insets.top + 10, { duration: 300 });
      toastOpacity.value = withTiming(1, { duration: 300 }, () => {
        toastY.value = withDelay(2500, withTiming(-100, { duration: 300 }));
        toastOpacity.value = withDelay(2500, withTiming(0, { duration: 300 }, () => {
          runOnJS(setActiveToast)(null);
        }));
      });
    }
  }, [activeToast, insets.top]);

  const animatedToastStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: toastY.value }],
      opacity: toastOpacity.value,
    };
  });

  // Keep screen awake during active drive
  useKeepAwake();

  const formatTimer = useCallback((ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleStartConfirm = async () => {
    setShowStartModal(false);
    await session.startDrive();
  };

  const handleEndConfirm = () => {
    setShowEndModal(false);
    const result = session.stopDrive();
    if (result) {
      completedSessionRef.current = result;
      // Navigate to summary
      router.push({
        pathname: '/summary',
        params: {
          sessionData: JSON.stringify(result),
        },
      });
      session.resetDrive();
    }
  };

  const recentEvents = [...session.events].reverse();

  // ─── Pre-drive (idle) state ────────────────────────────────
  if (session.status === 'idle' || session.status === 'completed') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.idleContainer}>
          <View style={styles.idleIconContainer}>
            <Ionicons name="car-sport" size={48} color={theme.primary} />
          </View>
          <Text style={styles.idleTitle}>Ready to Drive?</Text>
          <Text style={styles.idleSubtitle}>
            Start monitoring your driving{'\n'}behavior and improve your score.
          </Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => setShowStartModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>Start Drive</Text>
          </TouchableOpacity>
        </View>

        <ConfirmModal
          visible={showStartModal}
          icon="car-sport"
          title="Start Drive?"
          message="Start monitoring your drive session? Sensor data will be collected."
          confirmText="Start"
          onConfirm={handleStartConfirm}
          onCancel={() => setShowStartModal(false)}
        />
      </SafeAreaView>
    );
  }

  // ─── Active drive state ────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {activeToast && (
        <Animated.View style={[styles.toastContainer, animatedToastStyle]}>
          <View style={[styles.toastIconContainer, { backgroundColor: activeToast.color + '20' }]}>
            <Ionicons name="warning" size={20} color={activeToast.color} />
          </View>
          <View style={styles.toastTextContainer}>
            <Text style={styles.toastTitle}>Alert</Text>
            <Text style={styles.toastMessage}>{activeToast.label}</Text>
          </View>
          <View style={[styles.toastDeductionBadge, { backgroundColor: activeToast.color }]}>
            <Text style={styles.toastDeductionText}>-{activeToast.deduction} PTS</Text>
          </View>
        </Animated.View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.activeHeader}>
          <Text style={styles.drivingLabel}>Driving... 🚗</Text>
          <TouchableOpacity
            style={styles.pauseButton}
            onPress={() => setShowEndModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="pause" size={18} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Timer */}
        <Text style={styles.timer}>{formatTimer(session.elapsedMs)}</Text>

        {/* Score + Stats Row */}
        <View style={styles.scoreStatsRow}>
          <View style={styles.scoreSection}>
            <Text style={styles.scoreLabel}>Current Score</Text>
            <ScoreRing
              score={session.score}
              size={100}
              strokeWidth={8}
              showRating={false}
            />
          </View>
          <View style={styles.statsList}>
            <StatCard
              label="Distance"
              value={`${(session.elapsedMs / 3600000 * 30).toFixed(1)} km`}
              compact
            />
            <View style={{ height: 16 }} />
            <StatCard
              label="Avg. Speed"
              value={`${Math.round(30 + Math.random() * 18)} km/h`}
              compact
            />
          </View>
        </View>

        {/* Live Sensors */}
        <Text style={styles.sectionTitle}>Live Sensors</Text>
        {session.sensorData && (
          <>
            <SensorCard
              title="Accelerometer"
              icon="bar-chart"
              values={[
                { label: 'x', value: session.sensorData.accelerometer?.x ?? 0 },
                { label: 'y', value: session.sensorData.accelerometer?.y ?? 0 },
                { label: 'z', value: session.sensorData.accelerometer?.z ?? 0 },
              ]}
            />
            <SensorCard
              title="Gyroscope"
              icon="sync"
              values={[
                { label: 'x', value: session.sensorData.gyroscope?.x ?? 0 },
                { label: 'y', value: session.sensorData.gyroscope?.y ?? 0 },
                { label: 'z', value: session.sensorData.gyroscope?.z ?? 0 },
              ]}
            />
            <SensorCard
              title="Device Motion"
              icon="phone-portrait"
              values={[
                { label: 'Pitch', value: session.sensorData.deviceMotion?.rotation?.beta?.toFixed(1) ?? '—' },
                { label: 'Roll', value: session.sensorData.deviceMotion?.rotation?.gamma?.toFixed(1) ?? '—' },
                { label: 'Yaw', value: session.sensorData.deviceMotion?.rotation?.alpha?.toFixed(1) ?? '—' },
              ]}
            />
            {session.sensorData.magnetometer && (
              <SensorCard
                title="Magnetometer"
                icon="compass"
                values={[
                  { label: 'x', value: session.sensorData.magnetometer.x ?? 0 },
                  { label: 'y', value: session.sensorData.magnetometer.y ?? 0 },
                  { label: 'z', value: session.sensorData.magnetometer.z ?? 0 },
                ]}
              />
            )}
          </>
        )}

        {/* Recent Events */}
        {recentEvents.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
              Recent Events
            </Text>
            <ScrollView
              style={styles.eventsScrollView}
              contentContainerStyle={styles.eventsContainer}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
            >
              {recentEvents.map((event) => (
                <EventBadge key={event.id} event={event} />
              ))}
            </ScrollView>
          </>
        )}

      </ScrollView>

      {/* Pinned End Drive Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.endButton}
          onPress={() => setShowEndModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.endButtonText}>End Drive</Text>
        </TouchableOpacity>
      </View>

      {/* End Drive Modal */}
      <ConfirmModal
        visible={showEndModal}
        icon="stop-circle"
        title="End Drive?"
        message="End current drive? Your session will be saved."
        confirmText="End Drive"
        confirmColor={theme.red}
        onConfirm={handleEndConfirm}
        onCancel={() => setShowEndModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  // Idle state
  idleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  idleIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.borderStrong,
  },
  idleIcon: {
    // Replaced by Ionicons
  },
  idleTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    color: theme.text,
    marginBottom: 8,
  },
  idleSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  startButton: {
    backgroundColor: theme.primary,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  startButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 18,
    color: theme.text,
  },
  // Active state
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginBottom: 8,
  },
  drivingLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: 18,
    color: theme.textSecondary,
  },
  pauseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseIcon: {
    // Replaced by Ionicons
  },
  timer: {
    fontFamily: FontFamily.bold,
    fontSize: 48,
    color: theme.primary,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 2,
  },
  scoreStatsRow: {
    flexDirection: 'row',
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  scoreSection: {
    alignItems: 'center',
    marginRight: 20,
  },
  scoreLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 8,
  },
  statsList: {
    flex: 1,
    justifyContent: 'center',
  },
  sectionTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 15,
    color: theme.textSecondary,
    marginBottom: 12,
  },
  eventsContainer: {
    gap: 8,
  },
  eventsScrollView: {
    maxHeight: 272, // Approx 4 events (each is ~60px height + 8px gap)
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
    backgroundColor: theme.background,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  endButton: {
    backgroundColor: theme.red,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  endButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    color: theme.text,
  },
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    backgroundColor: theme.cardAlt,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.borderStrong,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 999,
  },
  toastIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  toastTextContainer: {
    flex: 1,
  },
  toastTitle: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  toastMessage: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: theme.text,
    marginTop: 2,
  },
  toastDeductionBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toastDeductionText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: theme.textLight,
  },
});
