// motion-landing/src/components/MotionLogo.tsx - Using Your Real Assets
import Image from 'next/image';

interface MotionLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  variant?: 'icon' | 'text' | 'full';
  theme?: 'light' | 'dark';
  useFullLogo?: boolean;
}

const MotionLogo: React.FC<MotionLogoProps> = ({
  size = 'md',
  variant = 'full',
  theme = 'light',
  useFullLogo = false
}) => {
  // Size configurations - Added 'hero' for bigger landing page logo
  const sizeConfig = {
    xs: { icon: 20, text: 'text-sm', spacing: 'gap-1' },
    sm: { icon: 32, text: 'text-base', spacing: 'gap-2' },
    md: { icon: 40, text: 'text-lg', spacing: 'gap-3' },
    lg: { icon: 56, text: 'text-2xl', spacing: 'gap-4' },
    xl: { icon: 80, text: 'text-4xl', spacing: 'gap-6' },
    hero: { icon: 200, text: 'text-6xl', spacing: 'gap-8' } // Even bigger for hero
  };

  const { icon: iconSize, text: textSize, spacing } = sizeConfig[size];

  // Theme configurations
  const colors = {
    light: {
      text: 'text-brand-sage dark:text-brand-cream',
      accent: 'text-brand-gold'
    },
    dark: {
      text: 'text-brand-cream',
      accent: 'text-brand-gold'
    }
  };

  const currentColors = colors[theme];

  // Logo icon component - Using your actual files
  const LogoIcon = () => {
    if (useFullLogo) {
      // Use full logo PNG for hero sections
      return (
        <Image
          src="/icon.png"
          alt="Motion Logo"
          width={iconSize}
          height={iconSize}
          className="object-contain"
        />
      );
    } else {
      // Use your actual swirl logo for navigation
      return (
        <Image
          src="/logo-swirl.png"
          alt="Motion Swirl"
          width={iconSize}
          height={iconSize}
          className="object-contain"
        />
      );
    }
  };

  // Render based on variant
  if (variant === 'icon') {
    return <LogoIcon />;
  }

  if (variant === 'text') {
    return (
      <span className={`${textSize} font-bold ${currentColors.text} transition-colors duration-300`}>
        Motion
      </span>
    );
  }

  // Full variant logic
  if (useFullLogo) {
    // For landing page hero - show the complete logo image only
    return <LogoIcon />;
  } else {
    // For navbar - show swirl + text separately
    return (
      <div className={`flex items-center ${spacing}`}>
        <LogoIcon />
        <div className="flex flex-col">
          <span className={`${textSize} font-bold ${currentColors.text} transition-colors duration-300`}>
            Motion
          </span>
          {size !== 'xs' && (
            <span className={`text-xs ${currentColors.accent} font-medium italic transition-colors duration-300`}>
              Go with the Flow
            </span>
          )}
        </div>
      </div>
    );
  }
};

export default MotionLogo;