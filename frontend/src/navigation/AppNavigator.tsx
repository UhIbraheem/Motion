// src/navigation/AppNavigator.tsx - Final SVG Implementation
import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MotionLogo from '../components/shared/MotionLogo';

// Import your SVG icons directly
import CompassSage from '../../assets/icons/compass-sage.svg';
import CompassGold from '../../assets/icons/compass-gold.svg';
import BookOpenSage from '../../assets/icons/book-open-sage.svg';
import BookOpenGold from '../../assets/icons/book-open-gold.svg';
import CoffeeSage from '../../assets/icons/coffee-sage.svg';
import CoffeeGold from '../../assets/icons/coffee-gold.svg';
import UserSage from '../../assets/icons/user-sage.svg';
import UserGold from '../../assets/icons/user-gold.svg';

// Import screens
import DiscoverScreen from '../screens/DiscoverScreen';
import CurateScreen from '../screens/CurateScreen';
import PlansScreen from '../screens/PlansScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Define navigation types
type MainTabParamList = {
  Discover: undefined;
  Curate: undefined;
  Plans: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

// Custom tab icons using your actual SVG files
const TabIcon = ({ iconName, focused, size = 24 }: { iconName: string; focused: boolean; size?: number }) => {
  // Map icon names to SVG components
  const iconComponents = {
    discover: focused ? CompassGold : CompassSage,
    curate: focused ? BookOpenGold : BookOpenSage,
    plans: focused ? CoffeeGold : CoffeeSage,
    profile: focused ? UserGold : UserSage,
  };

  const IconComponent = iconComponents[iconName as keyof typeof iconComponents];
  
  return (
    <View style={{ 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: 40,
      transform: [
        { scale: focused ? 1.2 : 1 },
        { translateY: focused ? -2 : 0 }
      ]
    }}>
      <IconComponent
        width={focused ? size + 4 : size}
        height={focused ? size + 4 : size}
        // SVGs will use their original colors (sage/gold)
      />
      {focused && (
        <View style={{
          width: 4,
          height: 4,
          backgroundColor: '#f2cc6c', // brand-gold dot
          borderRadius: 2,
          marginTop: 2
        }} />
      )}
    </View>
  );
};

const AppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#f2cc6c', // brand-gold for active
        tabBarInactiveTintColor: '#3c7660', // brand-sage for inactive
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#f6dc9b', // brand-light
          paddingTop: 12,  // Increased from 8
          paddingBottom: 12, // Increased from 8
          height: 95, // Increased from 85 for more space above home bar
          borderTopWidth: 2,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarShowLabel: true, // Show labels
        headerShown: true,
        headerStyle: {
          backgroundColor: '#f8f2d5', // brand-cream
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#f6dc9b', // brand-light
          height: 90,
        },
        headerTitleAlign: 'center',
        headerTitle: () => (
          // Using just the swirl icon in the header
          <MotionLogo size="sm" variant="icon" theme="light" />
        ),
      }}
    >
      <Tab.Screen 
        name="Discover" 
        component={DiscoverScreen}
        options={{
          tabBarIcon: ({ focused, size }) => (
            <TabIcon iconName="discover" focused={focused} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Curate" 
        component={CurateScreen}
        options={{
          tabBarIcon: ({ focused, size }) => (
            <TabIcon iconName="curate" focused={focused} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Plans" 
        component={PlansScreen}
        options={{
          tabBarIcon: ({ focused, size }) => (
            <TabIcon iconName="plans" focused={focused} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused, size }) => (
            <TabIcon iconName="profile" focused={focused} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;