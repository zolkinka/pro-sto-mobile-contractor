import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const logoSource = require('@/assets/images/prosto-logo.png');

type ProStoLogoProps = {
  width?: number;
};

const LOGO_ASPECT_RATIO = 188 / 49;

export function ProStoLogo({ width = 140 }: ProStoLogoProps) {
  const height = width / LOGO_ASPECT_RATIO;

  return (
    <View style={styles.container}>
      <Image source={logoSource} style={{ width, height }} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
});
