/**
 * ErrorState — Error placeholder with retry
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontFamily } from '@/theme/fonts';
import { theme } from '@/theme/colors';

interface ErrorStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

export function ErrorState({
  icon = 'close-circle',
  title,
  message,
  actionText = 'Try Again',
  onAction,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={36} color={theme.red} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction} activeOpacity={0.8}>
          <Text style={styles.buttonText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.errorBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  title: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: theme.red,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  button: {
    backgroundColor: theme.red,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  buttonText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: theme.textLight,
  },
});
