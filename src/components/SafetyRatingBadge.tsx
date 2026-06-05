/**
 * SafetyRatingBadge — Pill badge for Excellent/Good/Fair/Poor
 */
import { scoringEngine } from '@/services/scoringEngine';
import { FontFamily } from '@/theme/fonts';
import type { SafetyRating } from '@/types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface SafetyRatingBadgeProps {
  rating: SafetyRating;
  size?: 'small' | 'medium' | 'large';
}

export function SafetyRatingBadge({ rating, size = 'small' }: SafetyRatingBadgeProps) {
  const color = scoringEngine.getRatingColor(rating);
  const isLarge = size === 'large';
  const isMedium = size === 'medium';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: color + '20',
          paddingHorizontal: isLarge ? 20 : isMedium ? 14 : 10,
          paddingVertical: isLarge ? 8 : isMedium ? 6 : 4,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color,
            fontSize: isLarge ? 16 : isMedium ? 13 : 11,
          },
        ]}
      >
        {rating}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    alignSelf: 'center',
  },
  text: {
    fontFamily: FontFamily.semiBold,
    textAlign: 'center'
  },
});
