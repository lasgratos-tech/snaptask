import type { RouteDefinition } from './routeDefinition'

export const taskDefinitionRoute: RouteDefinition = {
  method: 'GET',
  path: '/v4/tasks/:taskId/versions/:version',
}
