// src/navigation/AppNavigator.tsx - Collapsible Header with Better Typography
import React, { useState, useRef } from 'react';
import { View, Text, SafeAreaView, Animated, ScrollView } from 'react-native';
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

// Collapsible header component
const CollapsibleHeader = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Animation values
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [70, 45], // Less aggressive collapse - keep more space
    extrapolate: 'clamp',
  });

  const logoOpacity = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const dateOpacity = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const subtitleOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0.7], // Keep subtitle partially visible
    extrapolate: 'clamp',
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -6], // Less movement
    extrapolate: 'clamp',
  });

  const titleScale = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0.95], // Subtle scaling
    extrapolate: 'clamp',
  });

  return (
    <View className="flex-1">
      {/* Fixed Header */}
      <SafeAreaView className="bg-brand-sage">
        <Animated.View 
          style={{ height: headerHeight }}
          className="bg-brand-sage px-4 justify-end pb-2" // Remove or reduce pb-2 to pb-0
        >
          {/* Top row with logo and date - fades out on scroll */}
          <Animated.View 
            style={{ opacity: logoOpacity }}
            className="flex-row justify-between items-center mb-0"
          >
            <View className="flex-row items-center">
              <MotionLogo size="xs" variant="icon" theme="dark" />
              <Text 
                className="text-brand-cream ml-2"
                style={{ 
                  fontSize: 16,
                  fontWeight: '600',
                  fontFamily: 'System',
                  letterSpacing: -0.3
                }}
              >
                Motion
              </Text>
            </View>
            
            <Animated.View style={{ opacity: dateOpacity }} className="items-end">
              <Text 
                className="text-brand-cream/90"
                style={{ 
                  fontSize: 14,
                  fontWeight: '500',
                  fontFamily: 'System',
                  letterSpacing: -0.2
                }}
              >
                {getCurrentDate()}
              </Text>
              <Text 
                className="text-brand-gold"
                style={{ 
                  fontSize: 11,
                  fontWeight: '400',
                  fontFamily: 'System'
                }}
              >
                {getGreeting()} ✨
              </Text>
            </Animated.View>
          </Animated.View>

          {/* Page title */}
          <Animated.View 
            style={{ 
              transform: [
                { translateY: titleTranslateY },
                { scale: titleScale }
              ]
            }}
          >
            <Text 
              className="text-brand-cream"
              style={{ 
                fontSize: 20, // Slightly smaller
                fontWeight: '700',
                fontFamily: 'System',
                letterSpacing: -0.4
              }}
            >
              {title}
            </Text>
            <Animated.Text 
              className="text-brand-cream/70"
              style={{ 
                fontSize: 12, // Slightly smaller
                fontWeight: '400',
                fontFamily: 'System',
                letterSpacing: -0.1,
                opacity: subtitleOpacity
              }}
            >
            {'>'}
              {getPageSubtitle(title)}
            </Animated.Text>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>

      {/* Scrollable Content */}
      <Animated.ScrollView
        className="flex-1"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </Animated.ScrollView>
    </View>
  );
};

const getPageSubtitle = (title: string): string => {
  switch (title) {
    case 'Discover':
      return 'Community adventures';
    case 'Curate':
      return 'AI-powered creation';
    case 'My Adventures':
      return 'Your saved journeys';
    case 'Profile':
      return 'Settings & preferences';
    default:
      return 'Discover life in motion';
  }
};

// Wrapper components for each screen
const DiscoverScreenWrapper = () => (
  <CollapsibleHeader title="Discover">
    <DiscoverScreen />
  </CollapsibleHeader>
);

const CurateScreenWrapper = () => (
  <CollapsibleHeader title="Curate">
    <CurateScreen />
  </CollapsibleHeader>
);

const PlansScreenWrapper = () => (
  <CollapsibleHeader title="My Adventures">
    <PlansScreen />
  </CollapsibleHeader>
);

const ProfileScreenWrapper = () => (
  <CollapsibleHeader title="Profile">
    <ProfileScreen />
  </CollapsibleHeader>
);

// Custom tab icons
const TabIcon = ({ iconName, focused, size = 24 }: { iconName: string; focused: boolean; size?: number }) => {
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
      />
      {focused && (
        <View style={{
          width: 4,
          height: 4,
          backgroundColor: '#f2cc6c',
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
        tabBarActiveTintColor: '#f2cc6c',
        tabBarInactiveTintColor: '#3c7660',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#f6dc9b',
          paddingTop: 12,
          paddingBottom: 12,
          height: 95,
          borderTopWidth: 2,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
          fontFamily: 'System',
        },
        tabBarShowLabel: true,
        headerShown: false, // We're using our custom header
      }}
    >
      <Tab.Screen 
        name="Discover" 
        component={DiscoverScreenWrapper}
        options={{
          tabBarIcon: ({ focused, size }) => (
            <TabIcon iconName="discover" focused={focused} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Curate" 
        component={CurateScreenWrapper}
        options={{
          tabBarIcon: ({ focused, size }) => (
            <TabIcon iconName="curate" focused={focused} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Plans" 
        component={PlansScreenWrapper}
        options={{
          tabBarIcon: ({ focused, size }) => (
            <TabIcon iconName="plans" focused={focused} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreenWrapper}
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