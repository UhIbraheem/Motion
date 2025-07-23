// src/navigation/DiscoverNavigator.tsx - Simple Stack Navigator for Discover Tab
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import DiscoverScreen from '../screens/DiscoverScreen';

const Stack = createStackNavigator();

const DiscoverNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="DiscoverHome" 
        component={DiscoverScreen} 
      />
    </Stack.Navigator>
  );
};

export default DiscoverNavigator;
