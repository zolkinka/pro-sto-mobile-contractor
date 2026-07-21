import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface NavigationIconProps {
  size?: number;
  color?: string;
}

export const NavigationIcon: React.FC<NavigationIconProps> = ({ 
  size = 64, 
  color = '#302F2D' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Outer pin shape */}
      <Path
        d="M32 8C23.1634 8 16 15.1634 16 24C16 34.5 32 56 32 56C32 56 48 34.5 48 24C48 15.1634 40.8366 8 32 8Z"
        fill={color}
      />
      {/* Inner circle (white) */}
      <Circle cx="32" cy="24" r="8" fill="white" />
    </Svg>
  );
};
