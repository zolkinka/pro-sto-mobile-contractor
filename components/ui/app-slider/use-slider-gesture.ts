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
export const useSliderGesture = (params: UseSliderGestureParams) => {
  const {
    percentage,
    isActive,
    sliderWidth,
    maxPercentage,
    minPercentage,
    onUpdate,
    onChange,
  } = params;

  const startPercentage = useSharedValue(0);

  // Единый Pan gesture с максимально агрессивной активацией для Android
  const panGesture = Gesture.Pan()
    // Убираем activeOffset - активируемся немедленно
    .failOffsetY([-30, 30])
    // Большой hitSlop
    .hitSlop({
      top: 30,
      bottom: 30,
      left: 30,
      right: 30,
    })
    .minDistance(0)
    .shouldCancelWhenOutside(false)
    .manualActivation(false)
    .onStart(() => {
      isActive.value = true;
      startPercentage.value = percentage.value;
    })
    .onUpdate((event) => {
      let newPercentage = startPercentage.value + (event.translationX / sliderWidth) * 100;

      // Ограничиваем значение в диапазоне [0, 100] или в диапазоне с учётом min/max для range mode
      const minLimit = minPercentage ?? 0;
      const maxLimit = maxPercentage ?? 100;
      
      newPercentage = Math.max(minLimit, Math.min(maxLimit, newPercentage));

      percentage.value = newPercentage;
      runOnJS(onUpdate)(newPercentage);
    })
    .onEnd(() => {
      isActive.value = false;
      runOnJS(onChange)(percentage.value);
    });

  // Используем Exclusive чтобы блокировать другие жесты (например, скролл)
  return Gesture.Exclusive(panGesture);
};
