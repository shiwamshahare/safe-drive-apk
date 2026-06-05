/**
 * StatCard — Reusable stat display (label + value + optional icon)
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontFamily } from '@/theme/fonts';
import { theme } from '@/theme/colors';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  valueColor?: string;
  compact?: boolean;
}

export function StatCard({
  label,
  value,
  icon,
  valueColor = theme.text,
  compact = false,
}: StatCardProps) {
  if (compact) {
    return (
      <View style={styles.compactCard}>
        {icon && <Ionicons name={icon} size={16} color={theme.primary} style={styles.compactIcon} />}
        <Text style={[styles.compactValue, { color: valueColor }]}>{value}</Text>
        <Text style={styles.compactLabel}>{label}</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {icon && <Ionicons name={icon} size={18} color={theme.primary} style={styles.icon} />}
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: theme.textSecondary,
  },
  value: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
  },
  compactCard: {
    alignItems: 'center',
    flex: 1,
  },
  compactIcon: {
    marginBottom: 4,
  },
  compactValue: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
  },
  compactLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: theme.textSecondary,
    marginTop: 2,
  },
});
