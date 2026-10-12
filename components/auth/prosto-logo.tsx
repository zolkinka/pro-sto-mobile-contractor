import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const logoSource = require('@/assets/images/prosto-logo.png');

type ProStoLogoProps = {
  width?: number;
};

const LOGO_ASPECT_RATIO = 167 / 43;

export function ProStoLogo({ width = 120 }: ProStoLogoProps) {
  const height = width / LOGO_ASPECT_RATIO;

  return (
    <View style={styles.container} accessibilityLabel="просто">
      <Image
        source={logoSource}
        style={{ width, height }}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
