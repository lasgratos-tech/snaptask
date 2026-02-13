import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { DeliveryScreen } from './src/screens/DeliveryScreen'
import { PaymentScreen } from './src/screens/PaymentScreen'
import { CatalogueScreen } from './src/screens/CatalogueScreen'
import { TaskScreen } from './src/screens/TaskScreen'
import type { RootStackParamList } from './src/navigation/types'

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator>
          <Stack.Screen
            name="Catalogue"
            component={CatalogueScreen}
            options={{ title: 'Catalogue' }}
          />
          <Stack.Screen
            name="Task"
            component={TaskScreen}
            options={{ title: 'Task' }}
          />
          <Stack.Screen
            name="Payment"
            component={PaymentScreen}
            options={{ title: 'Payment' }}
          />
          <Stack.Screen
            name="Delivery"
            component={DeliveryScreen}
            options={{ title: 'Delivery' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
