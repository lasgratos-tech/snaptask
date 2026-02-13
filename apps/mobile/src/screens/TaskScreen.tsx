import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import * as DocumentPicker from 'expo-document-picker'
import React, { useMemo, useState } from 'react'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

import type { TaskInputField, TaskInputValues } from '../types/api'
import type { RootStackParamList } from '../navigation/types'
import { Card } from '../components/Card'
import { PrimaryButton } from '../components/PrimaryButton'
import { colors, spacing, radius, typography } from '../tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'Task'>

export function TaskScreen({ navigation, route }: Props) {
  const { task } = route.params
  const [inputValues, setInputValues] = useState<TaskInputValues>({})
  const [error, setError] = useState<string | null>(null)

  const inputs = useMemo(() => task.inputs ?? [], [task.inputs])

  const setInput = (fieldId: string, value: TaskInputValues[string]) => {
    setInputValues((prev) => ({ ...prev, [fieldId]: value }))
  }

  const handlePickFile = async (field: TaskInputField) => {
    setError(null)
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true })
    if (result.canceled || !result.assets?.[0]) {
      return
    }
    const asset = result.assets[0]
    setInput(field.id, {
      type: 'file',
      value: {
        uri: asset.uri,
        name: asset.name ?? 'upload',
        mimeType: asset.mimeType ?? undefined,
        size: asset.size ?? undefined,
      },
    })
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.title}>{task.name}</Text>
        <Text style={styles.subtitle}>{task.category}</Text>
        <Text style={styles.meta}>
          {task.price} {task.currency} • {task.deliverable}
        </Text>
        <Text style={styles.result}>{task.resultSummary}</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Inputs</Text>
        {inputs.map((field) => (
          <View key={field.id} style={styles.field}>
            <Text style={styles.label}>
              {field.label} {field.required ? '(required)' : ''}
            </Text>
            {field.type === 'text' ? (
              <TextInput
                style={styles.input}
                placeholder="Enter value"
                placeholderTextColor={colors.textSecondary}
                onChangeText={(value) => setInput(field.id, { type: 'text', value })}
              />
            ) : null}
            {field.type === 'enum' ? (
              <View style={styles.enumList}>
                {(field.options ?? []).map((option) => (
                  <Pressable
                    key={option.value}
                    style={styles.enumOption}
                    onPress={() =>
                      setInput(field.id, { type: 'enum', value: option.value })
                    }
                  >
                    <Text style={styles.enumText}>{option.label}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
            {field.type === 'file' ? (
              <PrimaryButton title="Choose file" onPress={() => handlePickFile(field)} />
            ) : null}
            {field.constraints ? (
              <Text style={styles.constraints}>
                {field.constraints.formats?.length
                  ? `Formats: ${field.constraints.formats.join(', ')}`
                  : ''}
                {field.constraints.maxSizeMb
                  ? ` Max size: ${field.constraints.maxSizeMb} MB`
                  : ''}
              </Text>
            ) : null}
          </View>
        ))}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </Card>

      <PrimaryButton
        title="Pay and execute"
        onPress={() => navigation.navigate('Payment', { task, input: inputValues })}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as '600',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
  },
  meta: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
  },
  result: {
    marginTop: spacing.sm,
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontWeight: typography.weight.semibold as '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.sm,
    color: colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    borderRadius: radius.sm,
    color: colors.textPrimary,
  },
  enumList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  enumOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  enumText: {
    color: colors.textPrimary,
  },
  constraints: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: 12,
  },
  errorText: {
    color: colors.error,
  },
})
