// src/navigation/AppNavigator.tsx - Clean Tab Navigation
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FloatingTabBar from './FloatingTabBar';

// Import screens
import DiscoverNavigator from './DiscoverNavigator';
import CurateScreen from '../screens/CurateScreen';
import PlansScreen from '../screens/PlansScreen';
import ProfileScreen from '../screens/ProfileScreen';

type MainTabParamList = {
  Discover: undefined;
  Curate: undefined;
  Plans: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

// Screen wrapper components

// Wrapper components for each screen
const DiscoverScreenWrapper = () => (
  <DiscoverNavigator />
);

const CurateScreenWrapper = () => (
  <CurateScreen />
);

const PlansScreenWrapper = () => (
  <PlansScreen />
);

const ProfileScreenWrapper = () => (
  <ProfileScreen />
);

const AppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={props => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Discover" 
        component={DiscoverScreenWrapper}
      />
      <Tab.Screen 
        name="Curate" 
        component={CurateScreenWrapper}
      />
      <Tab.Screen 
        name="Plans" 
        component={PlansScreenWrapper}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreenWrapper}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;