import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { SliderThumb } from './app-slider/slider-thumb';
import { AppSliderProps } from './app-slider/types';

/**
 * Универсальный слайдер с поддержкой single и range режимов
 * - Real-time обновление значений в тултипах
 * - Умное позиционирование тултипов с отступом от краев
 * - Плавная работа благодаря Reanimated 2
 */
export const AppSlider: React.FC<AppSliderProps> = ({
  min,
  max,
  step,
  value,
  valueFrom,
  valueTo,
  mode = 'single',
  onChange,
  onRangeChange,
  formatValue,
  style,
}) => {
  // Размеры и позиции
  const [sliderWidth, setSliderWidth] = useState(0);
  const screenWidth = useSharedValue(Dimensions.get('window').width);
  const containerXOffset = useSharedValue(0);
  
  // Состояния для отображаемых значений в тултипах
  const [displayValue, setDisplayValue] = useState(value ?? min);
  const [displayValueFrom, setDisplayValueFrom] = useState(valueFrom ?? min);
  const [displayValueTo, setDisplayValueTo] = useState(valueTo ?? max);
  
  // Флаги активности жестов
  const isGestureActive = useSharedValue(false);
  const isRangeStartActive = useSharedValue(false);
  const isRangeEndActive = useSharedValue(false);
  
  // Процентные значения для позиционирования
  const singleValue = useSharedValue(value ? ((value - min) / (max - min)) * 100 : 0);
  const rangeStart = useSharedValue(valueFrom ? ((valueFrom - min) / (max - min)) * 100 : 0);
  const rangeEnd = useSharedValue(valueTo ? ((valueTo - min) / (max - min)) * 100 : 100);

  // Синхронизация с внешними props
  useEffect(() => {
    if (mode === 'single' && value !== undefined && !isGestureActive.value) {
      const newPercentage = ((value - min) / (max - min)) * 100;
      singleValue.value = newPercentage;
      setDisplayValue(value);
    }
  }, [value, min, max, mode, isGestureActive.value, singleValue]);

  useEffect(() => {
    if (mode === 'range') {
      if (valueFrom !== undefined && !isRangeStartActive.value) {
        const newPercentage = ((valueFrom - min) / (max - min)) * 100;
        rangeStart.value = newPercentage;
        setDisplayValueFrom(valueFrom);
      }
      if (valueTo !== undefined && !isRangeEndActive.value) {
        const newPercentage = ((valueTo - min) / (max - min)) * 100;
        rangeEnd.value = newPercentage;
        setDisplayValueTo(valueTo);
      }
    }
  }, [valueFrom, valueTo, min, max, mode, isRangeStartActive.value, isRangeEndActive.value, rangeStart, rangeEnd]);

  // Утилиты для работы со значениями
  const snapToStep = useCallback((percentage: number): number => {
    const rawValue = min + (percentage / 100) * (max - min);
    const snapped = Math.round(rawValue / step) * step;
    return Math.max(min, Math.min(max, snapped));
  }, [min, max, step]);

  const percentageToValue = useCallback((percentage: number): number => {
    return snapToStep(percentage);
  }, [snapToStep]);

  // Обработчики для single mode
  const updateDisplayValue = useCallback((percentage: number) => {
    const newValue = percentageToValue(percentage);
    setDisplayValue(newValue);
  }, [percentageToValue]);

  const handleSingleChange = useCallback((percentage: number) => {
    const newValue = percentageToValue(percentage);
    onChange?.(newValue);
  }, [percentageToValue, onChange]);

  // Обработчики для range mode
  const updateDisplayValueFrom = useCallback((percentage: number) => {
    const newValue = percentageToValue(percentage);
    setDisplayValueFrom(newValue);
  }, [percentageToValue]);

  const updateDisplayValueTo = useCallback((percentage: number) => {
    const newValue = percentageToValue(percentage);
    setDisplayValueTo(newValue);
  }, [percentageToValue]);

  const handleRangeChange = useCallback((startPercentage: number, endPercentage: number) => {
    const from = percentageToValue(startPercentage);
    const to = percentageToValue(endPercentage);
    onRangeChange?.(from, to);
  }, [percentageToValue, onRangeChange]);

  // Анимированные стили для прогресс-бара
  const singleProgressStyle = useAnimatedStyle(() => ({
    width: `${singleValue.value}%`,
  }));

  const rangeProgressStyle = useAnimatedStyle(() => ({
    left: `${rangeStart.value}%`,
    width: `${rangeEnd.value - rangeStart.value}%`,
  }));

  const formatDisplayValue = (val: number) => {
    return formatValue ? formatValue(val) : `${val}`;
  };

  return (
    <View style={[styles.container, style]}>
      <View
        style={styles.sliderContainer}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          setSliderWidth(width);
          // Получаем абсолютную позицию на экране
          event.target.measure((_x, _y, _width, _height, pageX, _pageY) => {
            containerXOffset.value = pageX;
          });
        }}
      >
        {/* Background track */}
        <View style={styles.track} />

        {mode === 'single' ? (
          <>
            {/* Progress track for single mode */}
            <Animated.View style={[styles.progress, singleProgressStyle]} />

            {/* Thumb for single mode */}
            <SliderThumb
              percentage={singleValue}
              isActive={isGestureActive}
              displayValue={displayValue}
              formatValue={formatValue}
              sliderWidth={sliderWidth}
              containerXOffset={containerXOffset}
              screenWidth={screenWidth}
              onUpdate={updateDisplayValue}
              onChange={handleSingleChange}
            />
          </>
        ) : (
          <>
            {/* Progress track for range mode */}
            <Animated.View style={[styles.progress, rangeProgressStyle]} />

            {/* Start thumb */}
            <SliderThumb
              percentage={rangeStart}
              isActive={isRangeStartActive}
              displayValue={displayValueFrom}
              formatValue={formatValue}
              sliderWidth={sliderWidth}
              containerXOffset={containerXOffset}
              screenWidth={screenWidth}
              maxPercentage={rangeEnd.value - 1}
              onUpdate={updateDisplayValueFrom}
              onChange={(percentage) => handleRangeChange(percentage, rangeEnd.value)}
            />

            {/* End thumb */}
            <SliderThumb
              percentage={rangeEnd}
              isActive={isRangeEndActive}
              displayValue={displayValueTo}
              formatValue={formatValue}
              sliderWidth={sliderWidth}
              containerXOffset={containerXOffset}
              screenWidth={screenWidth}
              minPercentage={rangeStart.value + 1}
              onUpdate={updateDisplayValueTo}
              onChange={(percentage) => handleRangeChange(rangeStart.value, percentage)}
            />
          </>
        )}
      </View>

      {/* Min/Max labels */}
      <View style={styles.labels}>
        <Text style={styles.labelText}>{formatDisplayValue(min)}</Text>
        <Text style={styles.labelText}>{formatDisplayValue(max)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 38,
    paddingBottom: 12,
    gap: 10,
  },
  sliderContainer: {
    height: 20,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 6,
    backgroundColor: '#F4F3F0',
    borderRadius: 20,
  },
  progress: {
    position: 'absolute',
    height: 6,
    backgroundColor: '#302F2D',
    borderRadius: 5,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelText: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 18,
    color: '#888684',
  },
});
