import type { RouteDefinition } from './routeDefinition'

export const getReceiptRoute: RouteDefinition = {
  method: 'GET',
  path: '/v4/receipts/:receiptRef',
}

export const downloadReceiptRoute: RouteDefinition = {
  method: 'GET',
  path: '/v4/receipts/:receiptRef/download',
}
