/**
 * Home Dashboard — Main landing screen
 *
 * Shows greeting, average score, stats, last drive, recent drives, and quick actions.
 */
import { EmptyState } from '@/components/EmptyState';
import { SafetyRatingBadge } from '@/components/SafetyRatingBadge';
import { ScoreRing } from '@/components/ScoreRing';
import { StatCard } from '@/components/StatCard';
import { useDriveHistory } from '@/hooks/useDriveHistory';
import { scoringEngine } from '@/services/scoringEngine';
import { storageService } from '@/services/storageService';
import { theme } from '@/theme/colors';
import { FontFamily } from '@/theme/fonts';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { sessions, stats, loading, refresh } = useDriveHistory();

  const lastDrive = sessions.length > 0 ? sessions[0] : null;
  const recentDrives = sessions.slice(0, 5);

  const handleResetData = async () => {
    try {
      await storageService.resetAllData();
      router.replace('/splash');
    } catch (error) {
      console.error('Failed to reset data:', error);
    }
  };

  const formatDuration = useCallback((ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m ${secs}s`;
  }, []);

  const formatDate = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  const formatTime = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }, []);

  if (!loading && sessions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hola, Shiwam 👋</Text>
          <Text style={styles.subtitle}>Drive safe and keep improving!</Text>
        </View>
        <EmptyState
          icon="car-sport"
          title="No drives yet"
          message="Start your first drive and see your history here."
          actionText="Start Drive"
          onAction={() => router.push('/(tabs)/drive' as any)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={theme.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, Driver 👋</Text>
          <Text style={styles.subtitle}>Drive safe and keep improving!</Text>
        </View>

        {/* Average Score Card */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreCardTitle}>Average Score</Text>
          <View style={styles.scoreCardContent}>
            <ScoreRing
              score={stats.averageScore}
              size={130}
              strokeWidth={10}
              showRating={true}
            />
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            label="Total Drives"
            value={stats.totalDrives}
            icon="car-sport"
          />
          <View style={{ width: 12 }} />
          <StatCard
            label="Best Score"
            value={stats.bestScore}
            icon="trophy"
            valueColor={theme.primary}
          />
        </View>

        {/* Last Drive */}
        {lastDrive && (
          <TouchableOpacity
            style={styles.lastDriveCard}
            onPress={() => router.push({ pathname: '/drive-details', params: { id: lastDrive.id } })}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionTitle}>Last Drive</Text>
            <View style={styles.lastDriveContent}>
              <View style={styles.lastDriveInfo}>
                <Text style={styles.lastDriveDate}>
                  {formatDate(lastDrive.startTime)}
                </Text>
                <Text style={styles.lastDriveTime}>
                  {formatTime(lastDrive.startTime)}
                </Text>
              </View>
              <View style={styles.lastDriveScore}>
                <Text style={[styles.lastDriveScoreValue, {
                  color: scoringEngine.getRatingColor(lastDrive.rating),
                }]}>
                  {lastDrive.score}
                </Text>
                <SafetyRatingBadge rating={lastDrive.rating} />
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
            </View>
          </TouchableOpacity>
        )}

        {/* Recent Drives */}
        {recentDrives.length > 1 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recent Drives</Text>
            {recentDrives.slice(1).map((session) => (
              <TouchableOpacity
                key={session.id}
                style={styles.recentItem}
                onPress={() => router.push({ pathname: '/drive-details', params: { id: session.id } })}
                activeOpacity={0.7}
              >
                <View style={styles.recentItemInfo}>
                  <Text style={styles.recentDate}>
                    {formatDate(session.startTime)}
                  </Text>
                  <Text style={styles.recentTime}>
                    {formatTime(session.startTime)}
                  </Text>
                </View>
                <Text style={[styles.recentScore, {
                  color: scoringEngine.getRatingColor(session.rating),
                }]}>
                  {session.score}
                </Text>
                <SafetyRatingBadge rating={session.rating} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Start Drive Button */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => router.push('/(tabs)/drive' as any)}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>Start Drive</Text>
        </TouchableOpacity>

        {/* View History */}
        <TouchableOpacity
          style={styles.viewHistoryButton}
          onPress={() => router.push('/(tabs)/history' as any)}
          activeOpacity={0.8}
        >
          <Text style={styles.viewHistoryText}>View History</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={[styles.viewHistoryButton, { marginTop: 12, borderColor: theme.error }]}
          onPress={handleResetData}
          activeOpacity={0.8}
        >
          <Text style={[styles.viewHistoryText, { color: theme.error }]}>Clear AsyncStorage</Text>
        </TouchableOpacity> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: 10
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  header: {
    paddingTop: 16,
    marginBottom: 24,
  },
  greeting: {
    fontFamily: FontFamily.bold,
    fontSize: 26,
    color: theme.text,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: theme.textSecondary,
  },
  scoreCard: {
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  scoreCardTitle: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 16,
  },
  scoreCardContent: {
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 15,
    color: theme.textSecondary,
    marginBottom: 12,
  },
  lastDriveCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  lastDriveContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastDriveInfo: {
    flex: 1,
  },
  lastDriveDate: {
    fontFamily: FontFamily.semiBold,
    fontSize: 15,
    color: theme.text,
  },
  lastDriveTime: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: theme.textMuted,
    marginTop: 2,
  },
  lastDriveScore: {
    alignItems: 'center',
    marginRight: 8,
  },
  lastDriveScoreValue: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    marginBottom: 4,
  },
  recentSection: {
    marginBottom: 16,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  recentItemInfo: {
    flex: 1,
  },
  recentDate: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: theme.text,
  },
  recentTime: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: theme.textMuted,
    marginTop: 2,
  },
  recentScore: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    marginRight: 10,
  },
  startButton: {
    backgroundColor: theme.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  startButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    color: theme.text,
  },
  viewHistoryButton: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
  },
  viewHistoryText: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: theme.primary,
  },
});
