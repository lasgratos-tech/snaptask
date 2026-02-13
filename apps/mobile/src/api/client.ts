import { getApiBaseUrl } from '../config'
import type {
  CatalogueResponse,
  ExecuteResponse,
  TaskDefinition,
  TaskInputValues,
} from '../types/api'

type RequestOptions = RequestInit & { authToken?: string }

const REQUEST_TIMEOUT_MS = 15000

export function createIdempotencyKey() {
  return `ik_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const baseUrl = getApiBaseUrl()
  const url = `${baseUrl}${path}`
  const headers = new Headers(options.headers)

  headers.set('Content-Type', 'application/json')
  if (options.authToken) {
    headers.set('Authorization', `Bearer ${options.authToken}`)
  }
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  const res = await fetch(url, { ...options, headers, signal: controller.signal }).finally(() => {
    clearTimeout(timeoutId)
  })
  const data = await res.json()
  if (!res.ok) {
    const message = data?.message ?? data?.error ?? 'API_ERROR'
    throw new Error(message)
  }
  return data as T
}

export async function getCatalogue(authToken?: string) {
  return request<CatalogueResponse>('/v1/catalogue', { authToken })
}

export async function getTaskDefinition(taskCode: string, version: number, authToken?: string) {
  return request<TaskDefinition>(`/v1/tasks/${taskCode}/${version}`, { authToken })
}

export async function executeTask(
  taskCode: string,
  version: number,
  input: TaskInputValues,
  authToken?: string,
  idempotencyKey?: string,
) {
  return request<ExecuteResponse>('/v1/tasks/execute', {
    method: 'POST',
    body: JSON.stringify({ taskCode, version, input, idempotencyKey }),
    authToken,
  })
}
