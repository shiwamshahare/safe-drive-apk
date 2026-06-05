/**
 * EventBreakdownChart — Event counts by type
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { FontFamily } from '@/theme/fonts';
import { theme } from '@/theme/colors';
import { EVENT_META } from '@/types';
import type { DetectedEvent, DrivingEventType } from '@/types';

interface EventBreakdownChartProps {
  events: DetectedEvent[];
}

function EventIcon({ meta, size }: { meta: typeof EVENT_META[keyof typeof EVENT_META]; size: number }) {
  if (meta.iconFamily === 'MaterialCommunityIcons') {
    return <MaterialCommunityIcons name={meta.icon as any} size={size} color={meta.color} />;
  }
  return <Ionicons name={meta.icon as any} size={size} color={meta.color} />;
}

export function EventBreakdownChart({ events }: EventBreakdownChartProps) {
  // Count events by type
  const counts: Record<DrivingEventType, number> = {
    harsh_braking: 0,
    harsh_acceleration: 0,
    sharp_turn: 0,
    aggressive_steering: 0,
    excessive_movement: 0,
    phone_handling: 0,
  };

  for (const event of events) {
    counts[event.type]++;
  }

  const entries = (Object.entries(counts) as [DrivingEventType, number][])
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="shield-checkmark" size={32} color={theme.green} style={{ marginBottom: 8 }} />
        <Text style={styles.emptyText}>Excellent driving!{'\n'}No risky events detected.</Text>
      </View>
    );
  }

  const maxCount = Math.max(...entries.map(([, c]) => c));

  return (
    <View style={styles.container}>
      {entries.map(([type, count]) => {
        const meta = EVENT_META[type];
        const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

        return (
          <View key={type} style={styles.row}>
            <View style={styles.labelRow}>
              <EventIcon meta={meta} size={14} />
              <Text style={styles.label}>{meta.label}</Text>
              <Text style={styles.count}>{count}</Text>
            </View>
            <View style={styles.barBg}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${barWidth}%`,
                    backgroundColor: meta.color,
                  },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  row: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  label: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: theme.text,
    flex: 1,
  },
  count: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: theme.primary,
  },
  barBg: {
    height: 6,
    backgroundColor: theme.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 24,
  },

  emptyText: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
