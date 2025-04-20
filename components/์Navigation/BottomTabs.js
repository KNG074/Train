import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import BottomNavBar from '../BottomNavBar/BottomNavBar';
import TravelCostScreen from '../TravelCostScreen'; // นำเข้าไฟล์
import RouteSearchScreen from '../RouteSearchScreen'; // นำเข้าไฟล์

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator tabBar={(props) => <BottomNavBar {...props} />}>
      <Tab.Screen name="TravelCost" component={TravelCostScreen} options={{ headerShown: false }} />
      <Tab.Screen name="RouteSearchScreen" component={RouteSearchScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

