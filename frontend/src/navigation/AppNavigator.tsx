// src/navigation/AppNavigator.tsx - Collapsible Header with Better Typography
import React, { useRef } from 'react';
import { View, Text, SafeAreaView, Animated, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MotionLogo from '../components/shared/MotionLogo';
import FloatingTabBar from './FloatingTabBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;

const Tab = createBottomTabNavigator<MainTabParamList>();

const CollapsibleHeader = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  
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

  // Animation values
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [70, 45],
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
    outputRange: [1, 0.7],
    extrapolate: 'clamp',
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -6],
    extrapolate: 'clamp',
  });

  const titleScale = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });

  const floatingTabPadding = Math.max(insets.bottom + (isTablet ? 100 : 95), 110);

  return (
    <View className="flex-1">
      <SafeAreaView className="bg-brand-sage">
        <Animated.View 
          style={{ height: headerHeight }}
          className="bg-brand-sage px-4 justify-end pb-2"
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
                {getGreeting()}
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
                fontSize: 20,
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
                fontSize: 12,
                fontWeight: '400',
                fontFamily: 'System',
                letterSpacing: -0.1,
                opacity: subtitleOpacity
              }}
            >
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
        contentContainerStyle={{
          paddingBottom: floatingTabPadding,
        }}
      >
        {children}
      </Animated.ScrollView>
    </View>
  );
};

// Wrapper components for each screen
const DiscoverScreenWrapper = () => (
  <CollapsibleHeader title="Discover">
    <DiscoverNavigator />
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