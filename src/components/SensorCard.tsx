/**
 * SensorCard — Live sensor value display card
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontFamily } from '@/theme/fonts';
import { theme } from '@/theme/colors';

interface SensorCardProps {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  values: { label: string; value: number | string }[];
}

export function SensorCard({ title, icon, values }: SensorCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {icon && <Ionicons name={icon} size={14} color={theme.textSecondary} style={styles.icon} />}
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.valuesRow}>
        {values.map((v, i) => (
          <View key={i} style={styles.valueItem}>
            <Text style={styles.valueLabel}>{v.label}</Text>
            <Text style={styles.valueText}>
              {typeof v.value === 'number' ? v.value.toFixed(2) : v.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    marginRight: 6,
  },
  title: {
    fontFamily: FontFamily.semiBold,
    fontSize: 13,
    color: theme.textSecondary,
  },
  valuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  valueItem: {
    alignItems: 'center',
    flex: 1,
  },
  valueLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: theme.textMuted,
    marginBottom: 2,
  },
  valueText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    color: theme.primary,
  },
});
