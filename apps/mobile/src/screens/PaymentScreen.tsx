import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'

import { createIdempotencyKey, executeTask } from '../api/client'
import { PrimaryButton } from '../components/PrimaryButton'
import { getApiAuthToken } from '../config'
import type { RootStackParamList } from '../navigation/types'
import { colors, spacing, radius, typography } from '../tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>

export function PaymentScreen({ navigation, route }: Props) {
  const { task, input } = route.params
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [executionIdempotencyKey] = useState(createIdempotencyKey)

  const handlePay = async () => {
    setLoading(true)
    setError(null)
    try {
      const execution = await executeTask(
        task.taskCode,
        task.version,
        input,
        getApiAuthToken(),
        executionIdempotencyKey,
      )
      navigation.replace('Delivery', { result: execution })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'EXECUTION_ERROR')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{task.name}</Text>
        <Text style={styles.meta}>
          {task.price} {task.currency} • {task.deliverable}
        </Text>
        <Text style={styles.note}>Payment required before execution.</Text>
      </View>
      {loading ? <ActivityIndicator /> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <PrimaryButton
        title="Pay and launch execution"
        onPress={handlePay}
        disabled={loading}
        style={loading ? styles.disabledButton : undefined}
      />
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
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
  note: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  errorText: {
    color: colors.error,
  },
})
