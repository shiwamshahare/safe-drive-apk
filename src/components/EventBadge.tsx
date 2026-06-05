/**
 * EventBadge — Event notification badge with icon and timestamp
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { FontFamily } from '@/theme/fonts';
import { theme } from '@/theme/colors';
import { EVENT_META } from '@/types';
import type { DetectedEvent } from '@/types';

interface EventBadgeProps {
  event: DetectedEvent;
  compact?: boolean;
}

function EventIcon({ meta, size }: { meta: typeof EVENT_META[keyof typeof EVENT_META]; size: number }) {
  if (meta.iconFamily === 'MaterialCommunityIcons') {
    return <MaterialCommunityIcons name={meta.icon as any} size={size} color={meta.color} />;
  }
  return <Ionicons name={meta.icon as any} size={size} color={meta.color} />;
}

export function EventBadge({ event, compact = false }: EventBadgeProps) {
  const meta = EVENT_META[event.type];
  const time = new Date(event.timestamp);
  const timeStr = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  if (compact) {
    return (
      <View style={styles.compactBadge}>
        <EventIcon meta={meta} size={12} />
        <Text style={[styles.compactLabel, { color: meta.color }]}>
          {meta.label}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.badge}>
      <View style={[styles.iconContainer, { backgroundColor: meta.color + '20' }]}>
        <EventIcon meta={meta} size={18} />
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>{meta.label} Detected</Text>
        <Text style={styles.time}>{timeStr}</Text>
      </View>
      <View style={[styles.severityDot, {
        backgroundColor: event.severity === 'high' ? theme.red
          : event.severity === 'medium' ? theme.yellow
          : theme.green
      }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  content: {
    flex: 1,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: theme.text,
  },
  time: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: theme.textMuted,
    marginTop: 2,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  compactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },

  compactLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
  },
});
