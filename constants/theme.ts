/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // Auth & Form colors
    textPrimary: '#302F2D',
    textSecondary: '#888684',
    textTertiary: '#53514F',
    backgroundSecondary: '#F9F8F5',
    border: '#F4F3F0',
    error: '#D8182E',
    errorBackground: '#FFF5F6',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // Auth & Form colors (можно адаптировать для темной темы)
    textPrimary: '#ECEDEE',
    textSecondary: '#9BA1A6',
    textTertiary: '#9BA1A6',
    backgroundSecondary: '#1F1F1F',
    border: '#2C2C2C',
    error: '#FF4D4D',
    errorBackground: '#2D1F20',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

/**
 * Design system tokens from Figma
 */
export const theme = {
  colors: {
    gray: {
      900: '#302F2D',
      800: '#53514F',
      700: '#68655F',
      600: '#888684',
      500: '#A2A09C',
      400: '#B9B7B3',
      300: '#D3D2D0',
      200: '#E6E5E3',
      100: '#F9F8F5',
      50: '#FFFFFF',
    },
    accent: {
      primary: '#D8182E',
      secondary: '#6982E9',
    },
  },
};
