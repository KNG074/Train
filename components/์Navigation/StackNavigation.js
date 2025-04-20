import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import TravelCostScreen from '../TravelCostScreen'; // นำเข้าไฟล์
import RouteSearchScreen from '../RouteSearchScreen';

const Stack = createStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="TravelCost" component={TravelCostScreen} options={{ headerShown: false }} />
      <Stack.Screen name="RouteSearchScreen" component={RouteSearchScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
