import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from './icon';

// Доступные цвета для автомобиля
const COLORS = [
  { id: 'red', hex: '#CA3C3C', name: 'Красный' },
  { id: 'purple', hex: '#D046C7', name: 'Фиолетовый' },
  { id: 'green', hex: '#78C026', name: 'Зеленый' },
  { id: 'yellow', hex: '#F2B91C', name: 'Желтый' },
  { id: 'blue', hex: '#517EF1', name: 'Синий' },
  { id: 'gray', hex: '#A39F9F', name: 'Серый' },
  { id: 'black', hex: '#3C3434', name: 'Черный' },
];

interface ColorPickerProps {
  selectedColor: string | null;
  onColorSelect: (colorId: string) => void;
}

/**
 * Компонент выбора цвета автомобиля
 * Показывает 7 цветов, отмечает выбранный галочкой
 */
export const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onColorSelect,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Выберите цвет</Text>
      <View style={styles.colorsContainer}>
        {COLORS.map((color) => {
          const isSelected = selectedColor === color.id;
          return (
            <Pressable
              key={color.id}
              style={[styles.colorButton, { backgroundColor: color.hex }]}
              onPress={() => onColorSelect(color.id)}
              accessibilityLabel={`Выбрать ${color.name} цвет`}
            >
              {isSelected && (
                <Icon name="check" size={18} color="#FFFFFF" />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '400',
    color: '#53514F',
    lineHeight: 16.8,
  },
  colorsContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
