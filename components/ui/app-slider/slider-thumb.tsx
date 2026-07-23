import React, { useRef } from 'react';
import { PanResponder, Platform, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import Animated, { SharedValue, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
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
  const startPercentage = useRef(0);

  // Создаем PanResponder для обработки касаний
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      
      onPanResponderGrant: () => {
        isActive.value = true;
        startPercentage.current = percentage.value;
      },
      
      onPanResponderMove: (_, gestureState) => {
        let newPercentage = startPercentage.current + (gestureState.dx / sliderWidth) * 100;
        
        const minLimit = minPercentage ?? 0;
        const maxLimit = maxPercentage ?? 100;
        
        newPercentage = Math.max(minLimit, Math.min(maxLimit, newPercentage));
        
        percentage.value = newPercentage;
        onUpdate(newPercentage);
      },
      
      onPanResponderRelease: () => {
        isActive.value = false;
        onChange(percentage.value);
      },
    })
  ).current;

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
    <Animated.View 
      style={[styles.thumbContainer, thumbContainerStyle]}
      collapsable={false}
      {...panResponder.panHandlers}
    >
      <Animated.View
        style={[styles.tooltip, tooltipStyle]}
        onLayout={(event) => {
          tooltipWidth.value = event.nativeEvent.layout.width;
        }}
      >
        <AppText style={styles.tooltipText}>
          {formatDisplayValue(displayValue)}
        </AppText>
      </Animated.View>
      <View 
        style={styles.touchableWrapper}
        collapsable={false}
      >
        <View style={styles.thumb} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  thumbContainer: {
    position: 'absolute',
    alignItems: 'center',
    gap: 5,
    bottom: 0,
    // Увеличиваем область захвата на Android
    ...Platform.select({
      android: {
        paddingVertical: 30,
        paddingHorizontal: 30,
        marginVertical: -30,
        marginHorizontal: -30,
      },
      ios: {
        paddingVertical: 15,
        paddingHorizontal: 15,
        marginVertical: -15,
        marginHorizontal: -15,
      },
    }),
  },
  touchableWrapper: {
    // Дополнительная обертка для thumb
    padding: 0,
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
