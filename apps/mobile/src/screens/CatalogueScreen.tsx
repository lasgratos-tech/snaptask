import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native'

import { getCatalogue, getTaskDefinition } from '../api/client'
import type { TaskSummary } from '../types/api'
import { getApiAuthToken } from '../config'
import type { RootStackParamList } from '../navigation/types'
import { Card } from '../components/Card'
import { PrimaryButton } from '../components/PrimaryButton'
import { colors, spacing, typography } from '../tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'Catalogue'>

export function CatalogueScreen({ navigation }: Props) {
  const [tasks, setTasks] = useState<TaskSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const catalogue = await getCatalogue(getApiAuthToken())
        setTasks(catalogue.tasks)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'CATALOGUE_ERROR')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSelect = async (task: TaskSummary) => {
    setLoading(true)
    setError(null)
    try {
      const definition = await getTaskDefinition(task.taskCode, task.version, getApiAuthToken())
      navigation.navigate('Task', { task: definition })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'TASK_LOAD_ERROR')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )
  }

  return (
      <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => `${item.taskCode}@${item.version}`}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.cardHeader}>
              <Text style={styles.taskName}>{item.name}</Text>
              <Text style={styles.category}>{item.category}</Text>
            </View>
            <Text style={styles.meta}>
              {item.price} {item.currency} • {item.deliverable}
            </Text>
            <PrimaryButton title="Execute" onPress={() => handleSelect(item)} />
          </Card>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskName: {
    fontSize: typography.size.md,
    color: colors.textPrimary,
    fontWeight: typography.weight.semibold as '600',
  },
  category: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  meta: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: 13,
  },
  separator: {
    height: spacing.md,
  },
  errorText: {
    color: colors.error,
  },
})
