/**
 * Onest font families (linked from assets/fonts via react-native.config.js).
 * Naming matches pro-sto-mobile-client: Onest-Regular, Onest-Medium, Onest-SemiBold.
 */
export const fonts = {
  regular: 'Onest-Regular',
  medium: 'Onest-Medium',
  semiBold: 'Onest-SemiBold',
} as const;

export type FontFamily = (typeof fonts)[keyof typeof fonts];

export type FontWeight = keyof typeof fonts;

/** Default body text style — use as base for Text / TextInput. */
export const defaultTextStyle = {
  fontFamily: fonts.regular,
} as const;
