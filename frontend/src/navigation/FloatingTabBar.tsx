// frontend/src/navigation/FloatingTabBar.tsx
import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Dimensions, 
  StyleSheet,
  Animated
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

// Import your existing SVG icons
import CompassSage from '../../assets/icons/compass-sage.svg';
import CompassGold from '../../assets/icons/compass-gold.svg';
import BookOpenSage from '../../assets/icons/book-open-sage.svg';
import BookOpenGold from '../../assets/icons/book-open-gold.svg';
import CoffeeSage from '../../assets/icons/coffee-sage.svg';
import CoffeeGold from '../../assets/icons/coffee-gold.svg';
import UserSage from '../../assets/icons/user-sage.svg';
import UserGold from '../../assets/icons/user-gold.svg';

const { width: screenWidth } = Dimensions.get('window');

// Device adaptive sizing
const isTablet = screenWidth > 768;
const TAB_BAR_HEIGHT = isTablet ? 70 : 65;
const TAB_BAR_WIDTH = isTablet ? Math.min(400, screenWidth * 0.6) : screenWidth * 0.85;
const BOTTOM_SPACING = isTablet ? 30 : 20;

// Tab Icon Component
const TabIcon = ({ 
  iconName, 
  focused, 
  size = isTablet ? 28 : 24 
}: { 
  iconName: string; 
  focused: boolean; 
  size?: number 
}) => {
  const iconComponents = {
    Discover: focused ? CompassGold : CompassSage,
    Curate: focused ? BookOpenGold : BookOpenSage,
    Plans: focused ? CoffeeGold : CoffeeSage,
    Profile: focused ? UserGold : UserSage,
  };

  const IconComponent = iconComponents[iconName as keyof typeof iconComponents];
  
  return (
    <View style={styles.iconContainer}>
      <View style={[
        styles.iconWrapper,
        { transform: [{ scale: focused ? 1.1 : 1 }] }
      ]}>
        <IconComponent
          width={focused ? size + 2 : size}
          height={focused ? size + 2 : size}
        />
      </View>
    </View>
  );
};

// Main Floating Tab Bar Component
const FloatingTabBar: React.FC<BottomTabBarProps> = ({ 
  state, 
  descriptors, 
  navigation 
}) => {
  const insets = useSafeAreaInsets();
  const slideAnimation = useRef(new Animated.Value(0)).current;
  
  // Calculate bottom position with safe area
  const bottomPosition = Math.max(insets.bottom + BOTTOM_SPACING, BOTTOM_SPACING + 10);

  // Calculate bubble dimensions
  const totalTabs = state.routes.length;
  const tabWidth = TAB_BAR_WIDTH / totalTabs;
  const bubbleWidth = tabWidth * 0.95;
  const paddingHorizontal = isTablet ? 8 : 4;
  
  // Calculate tab positions
  const availableWidth = TAB_BAR_WIDTH - (paddingHorizontal * 2);
  const tabSpacing = availableWidth / totalTabs;
  
  const getTabPosition = (index: number) => {
    return paddingHorizontal + (index * tabSpacing) + (tabSpacing - bubbleWidth) / 2;
  };

  useEffect(() => {
    const bubblePosition = getTabPosition(state.index);
    
    Animated.spring(slideAnimation, {
      toValue: bubblePosition,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  }, [state.index]);

  return (
    <View style={[styles.container, { bottom: bottomPosition }]}>
      {/* Floating Glass Container */}
      <BlurView 
        intensity={15}
        tint="light"
        style={styles.blurContainer}
      >
        {/* Light grey brand overlay */}
        <View style={styles.brandOverlay} />
        
        {/* Swipeable sliding bubble */}
        <Animated.View
          style={[
            styles.slidingBubble,
            {
              width: bubbleWidth,
              left: slideAnimation,
            }
          ]}
        />
        
        {/* Tab Items Container */}
        <View style={styles.tabsContainer}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label = options.tabBarLabel !== undefined 
              ? options.tabBarLabel 
              : options.title !== undefined 
              ? options.title 
              : route.name;

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabItem}
                activeOpacity={0.7}
              >
                <TabIcon 
                  iconName={route.name} 
                  focused={isFocused} 
                  size={isTablet ? 28 : 24}
                />
                
                <Text style={[
                  styles.tabLabel,
                  isFocused ? styles.tabLabelFocused : styles.tabLabelUnfocused
                ]}>
                  {typeof label === 'function' 
                    ? label({
                        focused: isFocused,
                        color: isFocused ? '#f2cc6c' : '#3c7660',
                        position: 'below-icon',
                        children: route.name
                      })
                    : label
                  }
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
      
      {/* Shadow for floating effect */}
      <View style={styles.shadowContainer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: (screenWidth - TAB_BAR_WIDTH) / 2,
    width: TAB_BAR_WIDTH,
    height: TAB_BAR_HEIGHT,
    zIndex: 1000,
  },
  
  blurContainer: {
    flex: 1,
    borderRadius: TAB_BAR_HEIGHT / 2,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(237, 237, 237, .4)',
  },
  
  brandOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(200, 200, 200, 0.15)',
    borderRadius: TAB_BAR_HEIGHT / 2,
  },
  
  slidingBubble: {
    position: 'absolute',
    top: '50%',
    height: TAB_BAR_HEIGHT * 0.8,
    backgroundColor: 'rgba(60, 118, 96, 0.85)',
    borderRadius: (TAB_BAR_HEIGHT * 0.8) / 2,
    marginTop: -(TAB_BAR_HEIGHT * 0.8) / 2,
    zIndex: 1,
  },
  
  tabsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: isTablet ? 8 : 4,
    zIndex: 10,
  },
  
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isTablet ? 8 : 6,
    zIndex: 15,
  },
  
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: isTablet ? 32 : 28,
  },
  
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  tabLabel: {
    fontSize: isTablet ? 11 : 10,
    fontWeight: '500',
    marginTop: 2,
    fontFamily: 'System',
    textAlign: 'center',
  },
  
  tabLabelFocused: {
    color: '#f2cc6c',
    fontWeight: '600',
  },
  
  tabLabelUnfocused: {
    color: '#3c7660',
    opacity: 0.8,
  },
  
  shadowContainer: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -8,
    borderRadius: TAB_BAR_HEIGHT / 2,
    backgroundColor: 'transparent',
    shadowColor: '#3c7660',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: -1,
  },
});

export default FloatingTabBar;