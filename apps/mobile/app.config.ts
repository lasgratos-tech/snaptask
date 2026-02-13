import type { ExpoConfig } from 'expo/config'

const config: ExpoConfig = {
  name: 'SnapTask',
  slug: 'snaptask',
  scheme: 'snaptask',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  plugins: ['@stripe/stripe-react-native'],
  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    apiAuthToken: process.env.EXPO_PUBLIC_API_AUTH_TOKEN,
  },
}

export default config
