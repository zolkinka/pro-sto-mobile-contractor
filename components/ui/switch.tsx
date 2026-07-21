import React from 'react';
import { Pressable, StyleSheet, Animated } from 'react-native';
import { theme } from '@/constants/theme';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

/**
 * Кастомный переключатель (Switch)
 * Размеры: 44x24 (из макета Figma)
 */
export function Switch({ value, onValueChange, disabled = false }: SwitchProps) {
  const translateX = React.useRef(new Animated.Value(value ? 20 : 2)).current;

  React.useEffect(() => {
    Animated.timing(translateX, {
      toValue: value ? 20 : 2,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [value, translateX]);

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.container,
        value ? styles.containerActive : styles.containerInactive,
        disabled && styles.containerDisabled,
      ]}
    >
      <Animated.View
        style={[
          styles.thumb,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 24,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  containerActive: {
    backgroundColor: theme.colors.gray[900], // #302F2D
  },
  containerInactive: {
    backgroundColor: theme.colors.gray[200], // #F4F3F0
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
