import { Gesture } from 'react-native-gesture-handler';
import { SharedValue, runOnJS, useSharedValue } from 'react-native-reanimated';

interface UseSliderGestureParams {
  percentage: SharedValue<number>;
  isActive: SharedValue<boolean>;
  sliderWidth: number;
  maxPercentage?: number; // Для range mode - максимальное значение
  minPercentage?: number; // Для range mode - минимальное значение
  onUpdate: (percentage: number) => void;
  onChange: (percentage: number) => void;
}

/**
 * Хук для создания жеста перемещения ползунка
 */
export const useSliderGesture = ({
  percentage,
  isActive,
  sliderWidth,
  maxPercentage = 100,
  minPercentage = 0,
  onUpdate,
  onChange,
}: UseSliderGestureParams) => {
  const startX = useSharedValue(0);

  return Gesture.Pan()
    .onBegin(() => {
      isActive.value = true;
      startX.value = percentage.value;
    })
    .onUpdate((event) => {
      if (sliderWidth === 0) return;
      
      const deltaPercentage = (event.translationX / sliderWidth) * 100;
      const newPercentage = Math.max(
        minPercentage,
        Math.min(maxPercentage, startX.value + deltaPercentage)
      );
      
      percentage.value = newPercentage;
      runOnJS(onUpdate)(newPercentage);
    })
    .onEnd(() => {
      isActive.value = false;
      runOnJS(onChange)(percentage.value);
    })
    .onFinalize(() => {
      isActive.value = false;
    });
};
