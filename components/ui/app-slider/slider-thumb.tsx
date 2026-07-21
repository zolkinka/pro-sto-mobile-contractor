import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, SharedValue } from 'react-native-reanimated';
import { useSliderGesture } from './use-slider-gesture';
import { useTooltipPosition } from './use-tooltip-position';

interface SliderThumbProps {
  percentage: SharedValue<number>;
  isActive: SharedValue<boolean>;
  displayValue: number;
  formatValue?: (value: number) => string;
  sliderWidth: number;
  containerXOffset: SharedValue<number>;
  screenWidth: SharedValue<number>;
  maxPercentage?: number;
  minPercentage?: number;
  onUpdate: (percentage: number) => void;
  onChange: (percentage: number) => void;
}

/**
 * Компонент ползунка с тултипом
 */
export const SliderThumb: React.FC<SliderThumbProps> = ({
  percentage,
  isActive,
  displayValue,
  formatValue,
  sliderWidth,
  containerXOffset,
  screenWidth,
  maxPercentage,
  minPercentage,
  onUpdate,
  onChange,
}) => {
  const tooltipWidth = useSharedValue(0);

  // Создаем жест для перемещения
  const gesture = useSliderGesture({
    percentage,
    isActive,
    sliderWidth,
    maxPercentage,
    minPercentage,
    onUpdate,
    onChange,
  });

  // Стиль для позиционирования контейнера
  const thumbContainerStyle = useAnimatedStyle(() => {
    const leftPx = (percentage.value / 100) * sliderWidth;
    const halfTooltipWidth = tooltipWidth.value / 2;
    return {
      left: 0,
      transform: [{ translateX: leftPx - halfTooltipWidth }],
    };
  });

  // Стиль для коррекции позиции тултипа
  const tooltipStyle = useTooltipPosition({
    percentage,
    tooltipWidth,
    sliderWidth,
    containerXOffset,
    screenWidth,
  });

  const formatDisplayValue = (val: number) => {
    return formatValue ? formatValue(val) : `${val}`;
  };

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.thumbContainer, thumbContainerStyle]}>
        <Animated.View
          style={[styles.tooltip, tooltipStyle]}
          onLayout={(event) => {
            tooltipWidth.value = event.nativeEvent.layout.width;
          }}
        >
          <Text style={styles.tooltipText}>
            {formatDisplayValue(displayValue)}
          </Text>
        </Animated.View>
        <View style={styles.thumb} />
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  thumbContainer: {
    position: 'absolute',
    alignItems: 'center',
    gap: 5,
    bottom: 0,
  },
  tooltip: {
    backgroundColor: '#302F2D',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#15181E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
    minWidth: 20,
  },
  tooltipText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 16.8,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#302F2D',
    shadowColor: '#15181E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
});
