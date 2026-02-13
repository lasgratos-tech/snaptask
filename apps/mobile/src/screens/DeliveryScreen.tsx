import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import type { RootStackParamList } from '../navigation/types'
import { Card } from '../components/Card'
import { colors, spacing, radius, typography } from '../tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'Delivery'>

export function DeliveryScreen({ route }: Props) {
  const { result } = route.params
  const payload = typeof result === 'string' ? result : JSON.stringify(result, null, 2)

  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.title}>Result</Text>
        <Text style={styles.meta}>{payload}</Text>
      </Card>
      <View style={styles.notice}>
        <Text style={styles.noticeText}>Execution response returned.</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: typography.weight.semibold as '600',
    color: colors.textPrimary,
  },
  meta: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
  },
  notice: {
    padding: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noticeText: {
    color: colors.textSecondary,
  },
})
