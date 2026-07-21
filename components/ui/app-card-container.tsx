import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

export interface AppCardContainerProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const AppCardContainer: React.FC<AppCardContainerProps> = ({
  children,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#15181E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
});
