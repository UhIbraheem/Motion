// src/components/shared/MotionLogo.tsx - Updated with Swirl vs Full Logic
import React from 'react';
import { View, Text, Image, ImageStyle } from 'react-native';

interface MotionLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon' | 'text' | 'full';
  theme?: 'light' | 'dark';
  useFullLogo?: boolean; // For auth screens where you want the complete branding
}

const MotionLogo: React.FC<MotionLogoProps> = ({
  size = 'md',
  variant = 'full',
  theme = 'light',
  useFullLogo = false // Default to swirl-only
}) => {
  // Size configurations
  const sizeConfig = {
    xs: { icon: 20, text: 12, spacing: 4 },
    sm: { icon: 28, text: 14, spacing: 6 },
    md: { icon: 40, text: 18, spacing: 8 },
    lg: { icon: 56, text: 24, spacing: 12 },
    xl: { icon: 80, text: 32, spacing: 16 }
  };

  const { icon: iconSize, text: textSize, spacing } = sizeConfig[size];

  // Theme configurations
  const colors = {
    light: {
      text: '#3c7660',     // brand-sage
      accent: '#f2cc6c'    // brand-gold
    },
    dark: {
      text: '#f8f2d5',     // brand-cream
      accent: '#f2cc6c'    // brand-gold
    }
  };

  const currentColors = colors[theme];

  // Logo assets - swirl vs full logo
  const logoAssets = {
    swirl: {
      light: require('../../../assets/logo-swirl.png'), // Just the swirl
      dark: require('../../../assets/logo-swirl.png'),  // Same for now
    },
    full: {
      light: require('../../../assets/icon.png'),       // Your main icon.png file
      dark: require('../../../assets/icon.png'),        // Same icon.png for now
    }
  };

  // Choose which asset to use
  const currentAsset = useFullLogo 
    ? logoAssets.full[theme]
    : logoAssets.swirl[theme];

  // Image style
  const imageStyle: ImageStyle = {
    width: iconSize,
    height: iconSize,
    resizeMode: 'contain',
  };

  // Logo component
  const LogoIcon = () => (
    <Image 
      source={currentAsset}
      style={imageStyle}
    />
  );

  // Render based on variant
  if (variant === 'icon') {
    return <LogoIcon />;
  }

  if (variant === 'text') {
    return (
      <Text 
        style={{
          fontSize: textSize,
          fontWeight: '700',
          color: currentColors.text,
          fontFamily: 'System',
          letterSpacing: 0.5
        }}
      >
        Motion
      </Text>
    );
  }

  // Full variant logic
  if (useFullLogo) {
    // For auth screens - show the complete logo with background
    return <LogoIcon />;
  } else {
    // For app screens - show swirl + text separately
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing
      }}>
        <LogoIcon />
        <View style={{ flexDirection: 'column' }}>
          <Text 
            style={{
              fontSize: textSize,
              fontWeight: '700',
              color: currentColors.text,
              fontFamily: 'System',
              letterSpacing: 0.5
            }}
          >
            Motion
          </Text>
          <Text 
            style={{
              fontSize: textSize * 0.6,
              fontWeight: '400',
              color: currentColors.accent,
              fontFamily: 'System',
              letterSpacing: 0.3,
              fontStyle: 'italic'
            }}
          >
            Go with the Flow
          </Text>
        </View>
      </View>
    );
  }
};

export default MotionLogo;