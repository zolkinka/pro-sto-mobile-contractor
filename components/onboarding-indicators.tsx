import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface OnboardingIndicatorsProps {
  total: number;
  current: number;
}

export const OnboardingIndicators: React.FC<OnboardingIndicatorsProps> = ({ total, current }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            index === current && styles.activeDot,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D3D2D0',
  },
  activeDot: {
    backgroundColor: '#302F2D',
    width: 24,
  },
});
