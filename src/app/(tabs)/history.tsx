/**
 * Drive History Screen — List of all past drives with filtering
 */
import { DriveListItem } from '@/components/DriveListItem';
import { EmptyState } from '@/components/EmptyState';
import { useDriveHistory, type HistoryFilter } from '@/hooks/useDriveHistory';
import { theme } from '@/theme/colors';
import { FontFamily } from '@/theme/fonts';
import type { DriveSession } from '@/types';
import { router } from 'expo-router';
import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FILTERS: { key: HistoryFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'best', label: 'Best' },
  { key: 'latest', label: 'Latest' },
  { key: 'worst', label: 'Worst' },
];

export default function HistoryScreen() {
  const { sessions, loading, filter, setFilter, refresh } = useDriveHistory();

  const handleDrivePress = (session: DriveSession) => {
    router.push({
      pathname: '/drive-details',
      params: { id: session.id },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Drive History</Text>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterTab, filter === f.key && styles.filterTabActive]}
            onPress={() => setFilter(f.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterLabel,
                filter === f.key && styles.filterLabelActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {sessions.length === 0 && !loading ? (
        <EmptyState
          icon="list"
          title="No History"
          message={"No drives yet.\nStart your first drive and see your history here."}
          actionText="Start Drive"
          onAction={() => router.push('/(tabs)/drive' as any)}
        />
      ) : (
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
          {sessions.map((session) => (
            <DriveListItem
              key={session.id}
              session={session}
              onPress={handleDrivePress}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 26,
    color: theme.text,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
  },
  filterTabActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  filterLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: theme.textSecondary,
  },
  filterLabelActive: {
    color: theme.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
});
