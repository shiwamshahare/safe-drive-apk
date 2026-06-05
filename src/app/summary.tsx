/**
 * Drive Summary Screen — Post-drive results
 *
 * Shows score, rating, event breakdown, score timeline, and save option.
 */
import { ConfirmModal } from '@/components/ConfirmModal';
import { EventBreakdownChart } from '@/components/EventBreakdownChart';
import { SafetyRatingBadge } from '@/components/SafetyRatingBadge';
import { ScoreRing } from '@/components/ScoreRing';
import { ScoreTimeline } from '@/components/ScoreTimeline';
import { StatCard } from '@/components/StatCard';
import { scoringEngine } from '@/services/scoringEngine';
import { storageService } from '@/services/storageService';
import { theme } from '@/theme/colors';
import { FontFamily } from '@/theme/fonts';
import type { DriveSession } from '@/types';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SummaryScreen() {
  const { sessionData } = useLocalSearchParams<{ sessionData: string }>();
  const [saved, setSaved] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const session: DriveSession | null = useMemo(() => {
    if (!sessionData) return null;
    try {
      return JSON.parse(sessionData) as DriveSession;
    } catch {
      return null;
    }
  }, [sessionData]);

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No session data available</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/(tabs)/' as any)}
          >
            <Text style={styles.backButtonText}>Go Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formatDuration = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = async () => {
    if (saving || saved) return;
    setSaving(true);
    try {
      await storageService.saveSession(session);
      setSaved(true);
      setShowSavedModal(true);
    } catch (error) {
      console.error('Failed to save session:', error);
    } finally {
      setSaving(false);
    }
  };

  const ratingColor = scoringEngine.getRatingColor(session.rating);
  const message = scoringEngine.getMotivationalMessage(session.rating);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.headerTitle}>Drive Complete!</Text>

        {/* Score Ring */}
        <View style={styles.scoreContainer}>
          <ScoreRing
            score={session.score}
            size={180}
            strokeWidth={12}
            showRating={false}
          />
          <View style={styles.ratingContainer}>
            <SafetyRatingBadge rating={session.rating} size="large" />
            <Text style={[styles.ratingLabel, { color: ratingColor }]}>
              {session.rating === 'Excellent' || session.rating === 'Good'
                ? 'Good Driver'
                : 'Needs Improvement'}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            label="Duration"
            value={formatDuration(session.duration)}
            icon="time"
            compact
          />
          <StatCard
            label="Total Events"
            value={session.totalEvents}
            icon="warning"
            compact
          />
        </View>

        {/* Event Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Breakdown</Text>
          <View style={styles.sectionCard}>
            <EventBreakdownChart events={session.events} />
          </View>
        </View>

        {/* Score Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Score Timeline</Text>
          <ScoreTimeline
            data={session.scoreHistory}
            width={SCREEN_WIDTH - 40}
            height={160}
          />
        </View>

        {/* Motivational Message */}
        <View style={styles.messageCard}>
          <Text style={styles.messageText}>{message}</Text>
        </View>

        {/* Buttons */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            saved && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={saved || saving}
        >
          <Text style={styles.saveButtonText}>
            {saved ? '✓ Session Saved' : saving ? 'Saving...' : 'Save Session'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.replace('/(tabs)/' as any)}
          activeOpacity={0.8}
        >
          <Text style={styles.homeButtonText}>Back Home</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Saved confirmation */}
      <ConfirmModal
        visible={showSavedModal}
        icon="checkmark-circle"
        title="Drive Saved"
        message="Drive saved successfully!"
        confirmText="Go Home"
        confirmColor={theme.green}
        showCancel={false}
        onConfirm={() => {
          setShowSavedModal(false);
          router.replace('/(tabs)/' as any);
        }}
        onCancel={() => setShowSavedModal(false)}
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
    paddingBottom: 40,
    paddingTop: 20,
  },
  headerTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    color: theme.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  ratingLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: theme.border,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 15,
    color: theme.textSecondary,
    marginBottom: 12,
  },
  sectionCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  messageCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  messageText: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: theme.primary,
    textAlign: 'center',
    lineHeight: 22,
  },
  saveButton: {
    backgroundColor: theme.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonDisabled: {
    backgroundColor: theme.green,
  },
  saveButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    color: theme.text,
  },
  homeButton: {
    backgroundColor: theme.card,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  homeButtonText: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: theme.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontFamily: FontFamily.medium,
    fontSize: 16,
    color: theme.textSecondary,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: theme.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  backButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    color: theme.text,
  },
});
