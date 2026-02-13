import type { RouteDefinition } from './routeDefinition'

export const getAuditLogsRoute: RouteDefinition = {
  method: 'GET',
  path: '/v4/admin/audit/logs',
}

export const getAuditLogsByExecutionRoute: RouteDefinition = {
  method: 'GET',
  path: '/v4/admin/audit/executions/:executionId',
}
