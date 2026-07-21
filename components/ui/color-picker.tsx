import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Icon } from './icon';

// Доступные цвета для автомобиля (упорядочены логично: ахроматические + хроматические по радуге)
const COLORS = [
  { id: 'white', hex: '#FFFFFF', name: 'Белый' },
  { id: 'gray-light', hex: '#DCDCDC', name: 'Светло-серый' },
  { id: 'gray', hex: '#9C9999', name: 'Серый' },
  { id: 'black', hex: '#000000', name: 'Черный' },
  { id: 'red', hex: '#FC4829', name: 'Красный' },
  { id: 'orange', hex: '#FF8C00', name: 'Оранжевый' },
  { id: 'yellow', hex: '#FFD700', name: 'Жёлтый' },
  { id: 'green', hex: '#228B22', name: 'Зеленый' },
  { id: 'cyan', hex: '#00BFFF', name: 'Голубой' },
  { id: 'blue', hex: '#0066FF', name: 'Синий' },
  { id: 'purple', hex: '#8B00FF', name: 'Фиолетовый' },
  { id: 'brown', hex: '#926547', name: 'Коричневый' },
];

interface ColorPickerProps {
  selectedColor: string | null;
  onColorSelect: (colorId: string) => void;
}

/**
 * Компонент выбора цвета автомобиля
 * Показывает 8 цветов, отмечает выбранный галочкой
 */
export const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onColorSelect,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Выберите цвет</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.colorsContainer}
      >
        {COLORS.map((color) => {
          const isSelected = selectedColor === color.id;
          const isWhite = color.id === 'white';
          return (
            <Pressable
              key={color.id}
              style={[
                styles.colorButton, 
                { backgroundColor: color.hex },
                isWhite && styles.whiteBorder
              ]}
              onPress={() => onColorSelect(color.id)}
              accessibilityLabel={`Выбрать ${color.name} цвет`}
            >
              {isSelected && (
                <Icon name="check" size={18} color={isWhite ? "#808080" : "#FFFFFF"} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
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
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whiteBorder: {
    borderWidth: 1,
    borderColor: '#F4F3F0',
  },
});
