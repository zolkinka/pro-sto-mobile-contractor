import { useAnimatedStyle, SharedValue } from 'react-native-reanimated';

interface UseTooltipPositionParams {
  percentage: SharedValue<number>;
  tooltipWidth: SharedValue<number>;
  sliderWidth: number;
  containerXOffset: SharedValue<number>;
  screenWidth: SharedValue<number>;
  edgePadding?: number;
}

/**
 * Хук для расчета позиции тултипа с учетом границ экрана
 * Предотвращает выход тултипа за края экрана
 */
export const useTooltipPosition = ({
  percentage,
  tooltipWidth,
  sliderWidth,
  containerXOffset,
  screenWidth,
  edgePadding = 16,
}: UseTooltipPositionParams) => {
  return useAnimatedStyle(() => {
    'worklet';
    
    if (sliderWidth === 0 || tooltipWidth.value === 0) {
      return { transform: [{ translateX: 0 }] };
    }

    const thumbCenterX = (percentage.value / 100) * sliderWidth;
    const halfTooltipWidth = tooltipWidth.value / 2;
    
    // Абсолютная позиция левого и правого края тултипа на экране
    const tooltipLeftEdge = containerXOffset.value + thumbCenterX - halfTooltipWidth;
    const tooltipRightEdge = containerXOffset.value + thumbCenterX + halfTooltipWidth;
    
    let translateX = 0;
    
    // Проверяем выход за левый край
    if (tooltipLeftEdge < edgePadding) {
      translateX = edgePadding - tooltipLeftEdge;
    } 
    // Проверяем выход за правый край
    else if (tooltipRightEdge > screenWidth.value - edgePadding) {
      translateX = (screenWidth.value - edgePadding) - tooltipRightEdge;
    }
    
    return { transform: [{ translateX }] };
  });
};
