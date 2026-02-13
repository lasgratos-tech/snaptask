export interface TaskPrice {
  amountCents: number
  currency: string
}

export interface TaskPricingEntry {
  taskCode: string
  version: number
  price: TaskPrice
}
