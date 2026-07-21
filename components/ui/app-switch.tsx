import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

export interface AppSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export const AppSwitch: React.FC<AppSwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  style,
}) => {
  const translateX = useSharedValue(value ? 19 : 2);

  React.useEffect(() => {
    translateX.value = withTiming(value ? 19 : 2, {
      duration: 200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [value, translateX]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  return (
    <Pressable
      style={[
        styles.container,
        value ? styles.containerActive : styles.containerInactive,
        disabled && styles.containerDisabled,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled}
    >
      <Animated.View style={[styles.thumb, thumbStyle]} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 24,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  containerActive: {
    backgroundColor: '#302F2D',
  },
  containerInactive: {
    backgroundColor: '#F4F3F0',
  },
  containerDisabled: {
    opacity: 0.5,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
});
