import type { RouteDefinition } from './routeDefinition'

export const authorizePaymentRoute: RouteDefinition = {
  method: 'POST',
  path: '/v4/payments/authorize',
}

export const getPaymentRoute: RouteDefinition = {
  method: 'GET',
  path: '/v4/payments/:paymentRef',
}
