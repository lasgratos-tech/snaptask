import type { RouteDefinition } from './routeDefinition'

export const createExecutionRoute: RouteDefinition = {
  method: 'POST',
  path: '/v4/executions',
}

export const getExecutionRoute: RouteDefinition = {
  method: 'GET',
  path: '/v4/executions/:executionRequestId',
}
