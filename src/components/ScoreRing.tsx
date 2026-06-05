/**
 * ScoreRing — Animated circular score gauge
 *
 * Renders a circular progress ring showing the driving score (0-100).
 * Uses react-native-svg for the ring and react-native-reanimated for animation.
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { scoringEngine } from '@/services/scoringEngine';
import type { SafetyRating } from '@/types';
import { FontFamily } from '@/theme/fonts';

import { theme } from '@/theme/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showRating?: boolean;
  rating?: SafetyRating;
  animated?: boolean;
}

export function ScoreRing({
  score,
  size = 160,
  strokeWidth = 10,
  showRating = true,
  rating,
  animated = true,
}: ScoreRingProps) {
  const resolvedRating = rating ?? scoringEngine.getRating(score);
  const color = scoringEngine.getRatingColor(resolvedRating);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const progress = useSharedValue(0);

  useEffect(() => {
    const targetProgress = Math.max(0, Math.min(100, score)) / 100;
    if (animated) {
      progress.value = withTiming(targetProgress, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      progress.value = targetProgress;
    }
  }, [score, animated]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background ring */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={theme.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress ring */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View style={styles.centerContent}>
        <Text style={[styles.scoreText, { fontSize: size * 0.25, color }]}>
          {Math.round(score)}
        </Text>
        {showRating && (
          <Text style={[styles.ratingText, { color }]}>
            {resolvedRating}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontFamily: FontFamily.bold,
    lineHeight: undefined,
  },
  ratingText: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    marginTop: 2,
  },
});
