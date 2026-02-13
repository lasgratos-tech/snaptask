import Constants from 'expo-constants'

type ExpoExtra = {
  apiBaseUrl?: string
  stripePublishableKey?: string
  apiAuthToken?: string
}

const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtra

export function getApiBaseUrl() {
  if (!extra.apiBaseUrl) {
    throw new Error('Missing EXPO_PUBLIC_API_BASE_URL')
  }
  return extra.apiBaseUrl
}

export function getStripePublishableKey() {
  if (!extra.stripePublishableKey) {
    throw new Error('Missing EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY')
  }
  return extra.stripePublishableKey
}

export function getApiAuthToken() {
  return extra.apiAuthToken
}
