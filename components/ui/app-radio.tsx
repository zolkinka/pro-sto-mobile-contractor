import React from 'react';
import { Pressable, View, StyleSheet, ViewStyle } from 'react-native';

export interface AppRadioProps {
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export const AppRadio: React.FC<AppRadioProps> = ({
  selected,
  onPress,
  disabled = false,
  style,
}) => {
  return (
    <Pressable
      style={[
        styles.radio,
        selected && styles.radioSelected,
        disabled && styles.radioDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {selected && <View style={styles.radioInner} />}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  radio: {
    width: 28,
    height: 28,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#F4F3F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    backgroundColor: '#302F2D',
    borderColor: '#302F2D',
  },
  radioDisabled: {
    opacity: 0.5,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
});
