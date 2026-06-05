/**
 * Permissions Screen — Sensor access request
 */
import { sensorService } from '@/services/sensorService';
import { FontFamily } from '@/theme/fonts';
import { theme } from '@/theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const SENSORS = [
  {
    icon: 'bar-chart',
    name: 'Accelerometer',
    description: 'Detect sudden changes\n& harsh braking',
  },
  {
    icon: 'sync',
    name: 'Motion Sensors',
    description: 'Detect turns, movement\n& phone handling',
  },
  {
    icon: 'compass',
    name: 'Gyroscope',
    description: 'Detects orientation &\nsteering movements',
  },
] as const;

export default function PermissionsScreen() {
  const [granting, setGranting] = useState(false);

  const handleGrantPermission = async () => {
    setGranting(true);
    try {
      await sensorService.requestPermissions();
    } catch {
      // Continue anyway — Android doesn't need permissions
    }
    setGranting(false);
    await AsyncStorage.setItem('@safedrive_onboarded', 'true');
    router.replace('/(tabs)/' as any);
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('@safedrive_onboarded', 'true');
    router.replace('/(tabs)/' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header icon */}
        <View style={styles.headerIcon}>
          <Ionicons name="shield-checkmark" size={36} color={theme.primary} />
        </View>

        <Text style={styles.title}>
          We need access to{'\n'}your sensors
        </Text>

        <Text style={styles.subtitle}>
          SafeDrive uses your device sensors to{'\n'}detect driving behavior and improve{'\n'}your safety.
        </Text>

        {/* Sensor list */}
        <View style={styles.sensorList}>
          {SENSORS.map((sensor, index) => (
            <View key={index} style={styles.sensorItem}>
              <View style={styles.sensorIcon}>
                <Ionicons name={sensor.icon} size={22} color={theme.primary} />
              </View>
              <View style={styles.sensorInfo}>
                <Text style={styles.sensorName}>{sensor.name}</Text>
                <Text style={styles.sensorDesc}>{sensor.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Bottom buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.grantButton}
          onPress={handleGrantPermission}
          activeOpacity={0.8}
          disabled={granting}
        >
          <Text style={styles.grantButtonText}>
            {granting ? 'Granting...' : 'Grant Permission'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.8}
        >
          <Text style={styles.skipButtonText}>Not Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 26,
    color: theme.text,
    lineHeight: 34,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 22,
    marginBottom: 32,
  },
  sensorList: {
    gap: 16,
  },
  sensorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  sensorIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: theme.cardAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  sensorInfo: {
    flex: 1,
  },
  sensorName: {
    fontFamily: FontFamily.semiBold,
    fontSize: 15,
    color: theme.text,
    marginBottom: 4,
  },
  sensorDesc: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: theme.textMuted,
    lineHeight: 18,
  },
  bottomButtons: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
  grantButton: {
    backgroundColor: theme.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  grantButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    color: theme.text,
  },
  skipButton: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: theme.card,
  },
  skipButtonText: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: theme.textSecondary,
  },
});
