/**
 * ConfirmModal — Reusable confirmation dialog
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontFamily } from '@/theme/fonts';
import { theme } from '@/theme/colors';

interface ConfirmModalProps {
  visible: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
  showCancel?: boolean;
}

export function ConfirmModal({
  visible,
  icon,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = theme.primary,
  onConfirm,
  onCancel,
  showCancel = true,
}: ConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modal}>
              {icon && (
                <View style={styles.iconContainer}>
                  <Ionicons name={icon} size={32} color={confirmColor} />
                </View>
              )}
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
              <View style={styles.buttons}>
                <TouchableOpacity
                  style={[styles.confirmButton, { backgroundColor: confirmColor }]}
                  onPress={onConfirm}
                  activeOpacity={0.8}
                >
                  <Text style={styles.confirmText}>{confirmText}</Text>
                </TouchableOpacity>
                {showCancel && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={onCancel}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelText}>{cancelText}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modal: {
    backgroundColor: theme.cardAlt,
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: theme.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  buttons: {
    width: '100%',
    gap: 10,
  },
  confirmButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  confirmText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: theme.text,
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: theme.card,
  },
  cancelText: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: theme.textSecondary,
  },
});
