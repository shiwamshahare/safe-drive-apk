/**
 * Splash Screen — SafeDrive branding and sensor initialization
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FontFamily } from '@/theme/fonts';
import { theme } from '@/theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
 
export default function SplashScreenPage() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const dotAnim = useRef(new Animated.Value(0)).current;
 
  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
 
    // Loading dot animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
    ).start();
 
    // Navigate after 2.5 seconds
    const timer = setTimeout(async () => {
      try {
        const onboarded = await AsyncStorage.getItem('@safedrive_onboarded');
        if (onboarded === 'true') {
          router.replace('/(tabs)/' as any);
        } else {
          router.replace('/permissions');
        }
      } catch {
        router.replace('/permissions');
      }
    }, 2500);
 
    return () => clearTimeout(timer);
  }, []);
 
  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Shield Logo */}
        <View style={styles.shield}>
          <Ionicons name="shield-checkmark" size={48} color={theme.primary} />
        </View>
 
        <Text style={styles.appName}>SafeDrive</Text>
        <Text style={styles.tagline}>Drive safe. Stay safe.</Text>
      </Animated.View>
 
      <Animated.View style={[styles.loaderContainer, { opacity: fadeAnim }]}>
        <View style={styles.loaderDots}>
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  opacity: dotAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1],
                  }),
                  transform: [
                    {
                      translateY: dotAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, i === 1 ? -6 : -3, 0],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
        <Text style={styles.loaderText}>Initializing sensors...</Text>
      </Animated.View>
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  shield: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: theme.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.borderStrong,
  },
  appName: {
    fontFamily: FontFamily.bold,
    fontSize: 36,
    color: theme.text,
    letterSpacing: 1,
  },
  tagline: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    color: theme.textSecondary,
    marginTop: 8,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  loaderDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.primary,
  },
  loaderText: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: theme.textMuted,
  },
});
