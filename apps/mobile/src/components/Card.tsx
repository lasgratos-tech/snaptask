import React from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'

import { colors, radius, spacing } from '../tokens'

type Props = {
  children: React.ReactNode
  style?: ViewStyle
}

export function Card({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
})
