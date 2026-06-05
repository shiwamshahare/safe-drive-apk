/**
 * DriveListItem — History row item
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontFamily } from '@/theme/fonts';
import { theme } from '@/theme/colors';
import { ScoreRing } from './ScoreRing';
import { SafetyRatingBadge } from './SafetyRatingBadge';
import type { DriveSession } from '@/types';

interface DriveListItemProps {
  session: DriveSession;
  onPress: (session: DriveSession) => void;
}

export function DriveListItem({ session, onPress }: DriveListItemProps) {
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

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(session)}
      activeOpacity={0.7}
    >
      <View style={styles.leftContent}>
        <Text style={styles.date}>{dateStr}</Text>
        <Text style={styles.time}>{timeStr}</Text>
      </View>
      <View style={styles.scoreContainer}>
        <ScoreRing
          score={session.score}
          size={44}
          strokeWidth={4}
          showRating={false}
          animated={false}
        />
      </View>
      <SafetyRatingBadge rating={session.rating} />
      <Ionicons name="chevron-forward" size={20} color={theme.textMuted} style={styles.chevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  leftContent: {
    flex: 1,
  },
  date: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    color: theme.text,
  },
  time: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
  scoreContainer: {
    marginRight: 12,
  },
  chevron: {
    marginLeft: 8,
  },
});
