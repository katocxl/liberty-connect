import { memo } from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

type Variant = 'primary' | 'secondary';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Button = memo(
  ({ label, onPress, variant = 'primary', disabled, loading, compact, style }: Props) => (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.secondary,
        compact && styles.compact,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && !loading && styles.pressed,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? <ActivityIndicator color={variant === 'primary' ? '#ffffff' : '#111827'} /> : <Text style={[styles.label, variant === 'primary' ? styles.labelPrimary : styles.labelSecondary]}>{label}</Text>}
    </Pressable>
  ),
);

Button.displayName = 'Button';

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compact: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  primary: {
    backgroundColor: '#2563eb',
  },
  secondary: {
    backgroundColor: '#e5e7eb',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  labelPrimary: {
    color: '#ffffff',
  },
  labelSecondary: {
    color: '#111827',
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.8,
  },
});
