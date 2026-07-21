import { ViewStyle } from 'react-native';
import { SharedValue } from 'react-native-reanimated';

export interface AppSliderProps {
  min: number;
  max: number;
  step: number;
  value?: number; // Для single mode
  valueFrom?: number; // Для range mode
  valueTo?: number; // Для range mode
  mode?: 'single' | 'range';
  onChange?: (value: number) => void; // Для single mode
  onRangeChange?: (from: number, to: number) => void; // Для range mode
  formatValue?: (value: number) => string;
  style?: ViewStyle;
}

export interface SliderThumbProps {
  percentage: SharedValue<number>;
  displayValue: number;
  formatValue?: (value: number) => string;
  sliderWidth: number;
  containerXOffset: SharedValue<number>;
  screenWidth: SharedValue<number>;
  onGestureStart: () => void;
  onGestureUpdate: (percentage: number) => void;
  onGestureEnd: (percentage: number) => void;
}
