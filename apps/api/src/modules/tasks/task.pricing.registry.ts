type TaskPricing = {
  amountCents: number
  currency: string
}

class TaskPricingRegistry {
  private pricing = new Map<string, TaskPricing>()

  register(code: string, version: number, pricing: TaskPricing) {
    this.pricing.set(`${code}@${version}`, pricing)
  }

  get(code: string, version: number) {
    return this.pricing.get(`${code}@${version}`)
  }
}

export const taskPricingRegistry = new TaskPricingRegistry()

// ===============================
// TEXT_PROCESS@1
// ===============================
taskPricingRegistry.register('TEXT_PROCESS', 1, {
  amountCents: 10,
  currency: 'EUR',
})

// ===============================
// IMAGE_ENHANCE@1
// ===============================
taskPricingRegistry.register('IMAGE_ENHANCE', 1, {
  amountCents: 25,
  currency: 'EUR',
})

// ===============================
// IMAGE_PRODUCT_PHOTO
// ===============================
taskPricingRegistry.register('IMAGE_PRODUCT_PHOTO', 1, {
  amountCents: 125,
  currency: 'EUR',

})
