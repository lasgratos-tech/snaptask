import React from 'react'
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native'

import { colors, radius, spacing, typography } from '../tokens'

type Props = {
  title: string
  onPress: () => void
  disabled?: boolean
  style?: ViewStyle
}

export function PrimaryButton({ title, onPress, disabled, style }: Props) {
  return (
    <Pressable
      style={[styles.button, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: typography.weight.semibold as '600',
  },
})
