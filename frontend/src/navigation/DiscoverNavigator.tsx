// src/navigation/DiscoverNavigator.tsx - Stack Navigator for Discover Tab
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { DiscoverStackParamList } from '../types/navigation';

// Import screens
import DiscoverScreen from '../screens/DiscoverScreen';
import FoodCategoryScreen from '../screens/CategoryScreens/FoodCategoryScreen';
import CultureCategoryScreen from '../screens/CategoryScreens/CultureCategoryScreen';
import OutdoorCategoryScreen from '../screens/CategoryScreens/OutdoorCategoryScreen';
import NightlifeCategoryScreen from '../screens/CategoryScreens/NightlifeCategoryScreen';

const Stack = createStackNavigator<DiscoverStackParamList>();

const DiscoverNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#f9fafb' },
      }}
    >
      <Stack.Screen 
        name="DiscoverHome" 
        component={DiscoverScreen} 
      />
      <Stack.Screen 
        name="FoodCategory" 
        component={FoodCategoryScreen}
        options={{
          cardStyleInterpolator: ({ current }) => ({
            cardStyle: {
              opacity: current.progress,
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  }),
                },
              ],
            },
          }),
        }}
      />
      <Stack.Screen 
        name="CultureCategory" 
        component={CultureCategoryScreen}
        options={{
          cardStyleInterpolator: ({ current }) => ({
            cardStyle: {
              opacity: current.progress,
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  }),
                },
              ],
            },
          }),
        }}
      />
      <Stack.Screen 
        name="OutdoorCategory" 
        component={OutdoorCategoryScreen}
        options={{
          cardStyleInterpolator: ({ current }) => ({
            cardStyle: {
              opacity: current.progress,
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  }),
                },
              ],
            },
          }),
        }}
      />
      <Stack.Screen 
        name="NightlifeCategory" 
        component={NightlifeCategoryScreen}
        options={{
          cardStyleInterpolator: ({ current }) => ({
            cardStyle: {
              opacity: current.progress,
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  }),
                },
              ],
            },
          }),
        }}
      />
    </Stack.Navigator>
  );
};

export default DiscoverNavigator;
