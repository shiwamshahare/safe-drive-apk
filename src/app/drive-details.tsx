/**
 * Drive Details Screen — Detailed view of a specific past drive
 */
import { EventBadge } from '@/components/EventBadge';
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
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DriveDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [session, setSession] = useState<DriveSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllEvents, setShowAllEvents] = useState(false);

  useEffect(() => {
    if (id) {
      storageService.getSession(id).then((s) => {
        setSession(s);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={theme.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Drive not found</Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const date = new Date(session.startTime);
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const formatDuration = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const ratingColor = scoringEngine.getRatingColor(session.rating);
  const displayedEvents = showAllEvents
    ? session.events
    : session.events.slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      {/* Back button header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backArrow}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Drive Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Date + Score Header */}
        <View style={styles.topSection}>
          <View style={styles.dateSection}>
            <Text style={styles.dateText}>{dateStr}</Text>
            <Text style={styles.timeText}>{timeStr}</Text>
          </View>
          <View style={styles.topScore}>
            <ScoreRing
              score={session.score}
              size={90}
              strokeWidth={7}
              showRating={false}
              animated={true}
            />
            <SafetyRatingBadge rating={session.rating} size="medium" />
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard
            label="Duration"
            value={formatDuration(session.duration)}
            compact
          />
          <StatCard
            label="Distance"
            value={`${session.distance} km`}
            compact
          />
        </View>

        {/* Events Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Events Timeline</Text>
          {session.events.length === 0 ? (
            <View style={styles.noEventsCard}>
              <Ionicons name="shield-checkmark-outline" size={32} color={theme.green} style={{ marginBottom: 8 }} />
              <Text style={styles.noEventsText}>
                Excellent driving!{'\n'}No risky events detected.
              </Text>
            </View>
          ) : (
            <>
              {displayedEvents.map((event) => (
                <EventBadge key={event.id} event={event} />
              ))}
              {session.events.length > 5 && !showAllEvents && (
                <TouchableOpacity
                  style={styles.showAllButton}
                  onPress={() => setShowAllEvents(true)}
                >
                  <Text style={styles.showAllText}>
                    View All Events ({session.events.length})
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* Event Breakdown */}
        {session.events.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Event Breakdown</Text>
            <View style={styles.sectionCard}>
              <EventBreakdownChart events={session.events} />
            </View>
          </View>
        )}

        {/* Score Over Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Score Over Time</Text>
          <ScoreTimeline
            data={session.scoreHistory}
            width={SCREEN_WIDTH - 40}
            height={180}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 18,
    color: theme.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  dateSection: {
    flex: 1,
  },
  dateText: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: theme.text,
    marginBottom: 4,
  },
  timeText: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: theme.textSecondary,
  },
  topScore: {
    alignItems: 'center',
    gap: 8,
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
  noEventsCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  noEventsText: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  showAllButton: {
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: theme.card,
    alignItems: 'center',
    marginTop: 4,
    borderWidth: 1,
    borderColor: theme.border,
  },
  showAllText: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: theme.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: FontFamily.medium,
    fontSize: 16,
    color: theme.textSecondary,
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: theme.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  backBtnText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    color: theme.text,
  },
});
