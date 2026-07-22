import { Slider } from '@miblanchard/react-native-slider';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';

import { AppSliderProps } from './app-slider/types';

/**
 * Универсальный слайдер на основе @miblanchard/react-native-slider
 * - Надежная работа на всех платформах (без нативных зависимостей)
 * - Поддержка single и range режимов
 * - Встроенная поддержка multi-touch для Android
 */
export const AppSlider: React.FC<AppSliderProps> = ({
  min,
  max,
  step = 1,
  value,
  valueFrom,
  valueTo,
  mode = 'single',
  onChange,
  onRangeChange,
  formatValue,
  style,
}) => {
  // Локальные состояния для плавного отображения
  const [localValue, setLocalValue] = useState(value ?? min);
  const [localRange, setLocalRange] = useState<[number, number]>([
    valueFrom ?? min,
    valueTo ?? max,
  ]);
  
  // Хранение размеров контейнера и тултипов для расчёта позиций
  const [containerWidth, setContainerWidth] = useState(0);
  const [leftTooltipWidth, setLeftTooltipWidth] = useState(0);
  const [rightTooltipWidth, setRightTooltipWidth] = useState(0);
  const [singleTooltipWidth, setSingleTooltipWidth] = useState(0);
  
  // Refs для отслеживания touch событий и определения направления
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isVerticalScrollRef = useRef(false);

  // Синхронизация с внешними props
  useEffect(() => {
    if (mode === 'single' && value !== undefined) {
      setLocalValue(value);
    }
  }, [value, mode]);

  useEffect(() => {
    if (mode === 'range') {
      setLocalRange([valueFrom ?? min, valueTo ?? max]);
    }
  }, [valueFrom, valueTo, mode, min, max]);

  const formatDisplayValue = (val: number) => {
    // Округляем до ближайшего шага для отображения (даже если внутреннее значение плавное)
    const roundedVal = snapToStep(val);
    return formatValue ? formatValue(roundedVal) : `${roundedVal}`;
  };

  // Функция для привязки значения к шагу
  const snapToStep = (val: number): number => {
    return Math.round(val / step) * step;
  };

  const handleValueChange = (values: number | number[]) => {
    // Во время перемещения обновляем значение без привязки к шагу (плавное движение)
    if (mode === 'single') {
      const val = Array.isArray(values) ? values[0] : values;
      setLocalValue(val);
    } else {
      const vals = Array.isArray(values) ? values : [values];
      setLocalRange([vals[0] ?? min, vals[1] ?? max]);
    }
  };

  const handleSlidingComplete = (values: number | number[]) => {
    // При отпускании привязываем к шагу и вызываем callback
    if (mode === 'single') {
      const val = Array.isArray(values) ? values[0] : values;
      const snappedValue = snapToStep(val);
      setLocalValue(snappedValue); // Обновляем локальное состояние с привязкой
      onChange?.(snappedValue);
    } else {
      const vals = Array.isArray(values) ? values : [values];
      const snappedValues: [number, number] = [
        snapToStep(vals[0] ?? min),
        snapToStep(vals[1] ?? max),
      ];
      setLocalRange(snappedValues); // Обновляем локальное состояние с привязкой
      onRangeChange?.(snappedValues[0], snappedValues[1]);
    }
  };

  // Вычисляем позицию тултипа в процентах
  const calculateTooltipPosition = (value: number): number => {
    const range = max - min;
    if (range === 0) return 0;
    return ((value - min) / range) * 100;
  };

  // Вычисляем корректную позицию тултипа с учётом границ экрана (в пикселях)
  const calculateSafeTooltipPosition = (
    positionPercent: number,
    tooltipWidth: number,
    containerWidth: number
  ): { left: number; transform: { translateX: number }[] } => {
    if (containerWidth === 0 || tooltipWidth === 0) {
      // Пока контейнер не измерен, используем базовое позиционирование
      const approxPosition = (positionPercent / 100) * 300; // Примерная ширина
      return {
        left: approxPosition,
        transform: [{ translateX: -28 }], // Примерная половина ширины тултипа
      };
    }

    const positionPx = (positionPercent / 100) * containerWidth;
    const halfTooltipWidth = tooltipWidth / 2;

    // Проверяем, выходит ли тултип за левую границу
    if (positionPx - halfTooltipWidth < 0) {
      return { left: 0, transform: [{ translateX: 0 }] };
    }

    // Проверяем, выходит ли тултип за правую границу
    if (positionPx + halfTooltipWidth > containerWidth) {
      return { 
        left: containerWidth, 
        transform: [{ translateX: -tooltipWidth }] 
      };
    }

    // Тултип помещается в контейнер - центрируем его
    return {
      left: positionPx,
      transform: [{ translateX: -halfTooltipWidth }],
    };
  };

  // Вычисляем позиции для range режима с учётом столкновений
  const calculateRangeTooltipPositions = (
    leftPercent: number,
    rightPercent: number,
    leftWidth: number,
    rightWidth: number,
    containerWidth: number
  ): {
    left: { left: number; transform: { translateX: number }[] };
    right: { left: number; transform: { translateX: number }[] };
  } => {
    if (containerWidth === 0 || leftWidth === 0 || rightWidth === 0) {
      const approxLeftPos = (leftPercent / 100) * 300;
      const approxRightPos = (rightPercent / 100) * 300;
      return {
        left: { left: approxLeftPos, transform: [{ translateX: -28 }] },
        right: { left: approxRightPos, transform: [{ translateX: -28 }] },
      };
    }

    const leftPosPx = (leftPercent / 100) * containerWidth;
    const rightPosPx = (rightPercent / 100) * containerWidth;
    const minGap = 8; // Минимальный зазор между тултипами

    const leftHalfWidth = leftWidth / 2;
    const rightHalfWidth = rightWidth / 2;

    // Проверяем, не сталкиваются ли тултипы
    const distance = rightPosPx - leftPosPx;
    const requiredDistance = leftHalfWidth + rightHalfWidth + minGap;

    if (distance < requiredDistance) {
      // Тултипы сталкиваются - сдвигаем их
      const overlap = requiredDistance - distance;
      const adjustedLeftPercent = Math.max(0, leftPercent - (overlap / containerWidth) * 100 * 0.5);
      const adjustedRightPercent = Math.min(100, rightPercent + (overlap / containerWidth) * 100 * 0.5);

      return {
        left: calculateSafeTooltipPosition(adjustedLeftPercent, leftWidth, containerWidth),
        right: calculateSafeTooltipPosition(adjustedRightPercent, rightWidth, containerWidth),
      };
    }

    // Тултипы не сталкиваются - размещаем их нормально
    return {
      left: calculateSafeTooltipPosition(leftPercent, leftWidth, containerWidth),
      right: calculateSafeTooltipPosition(rightPercent, rightWidth, containerWidth),
    };
  };

  if (mode === 'single') {
    const tooltipPosition = calculateTooltipPosition(localValue);
    const tooltipStyle = calculateSafeTooltipPosition(
      tooltipPosition,
      singleTooltipWidth || 56, // Примерная ширина если не измерена
      containerWidth
    );
    
    return (
      <View 
        style={[styles.container, style]}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        onStartShouldSetResponderCapture={() => {
          // Блокируем если это вертикальный скролл
          return isVerticalScrollRef.current;
        }}
        onTouchStart={(e) => {
          const touch = e.nativeEvent.touches[0];
          touchStartRef.current = {
            x: touch.pageX,
            y: touch.pageY,
            time: Date.now(),
          };
          isVerticalScrollRef.current = false;
        }}
        onTouchMove={(e) => {
          if (!touchStartRef.current) return;
          
          const touch = e.nativeEvent.touches[0];
          const deltaX = Math.abs(touch.pageX - touchStartRef.current.x);
          const deltaY = Math.abs(touch.pageY - touchStartRef.current.y);
          
          // Если вертикальное движение доминирует, помечаем как вертикальный скролл
          if (deltaY > 5 && deltaY > deltaX * 1.5) {
            isVerticalScrollRef.current = true;
          }
        }}
        onTouchEnd={() => {
          touchStartRef.current = null;
          isVerticalScrollRef.current = false;
        }}
      >
          {/* Tooltip с динамической позицией */}
          <View style={styles.tooltipRow}>
            <View
              style={[
                styles.tooltip,
                styles.tooltipAbsolute,
                tooltipStyle,
              ]}
              onLayout={(e) => setSingleTooltipWidth(e.nativeEvent.layout.width)}
            >
              <AppText style={styles.tooltipText}>
                {formatDisplayValue(localValue)}
              </AppText>
            </View>
          </View>

          {/* Slider */}
          <Slider
            value={localValue}
            minimumValue={min}
            maximumValue={max}
            step={0} // Плавное движение без привязки к шагу во время перемещения
            onValueChange={handleValueChange}
            onSlidingComplete={handleSlidingComplete}
            minimumTrackTintColor="#302F2D"
            maximumTrackTintColor="#F4F3F0"
            thumbTintColor="#FFFFFF"
            thumbStyle={styles.thumb}
            trackStyle={styles.track}
            containerStyle={styles.sliderContainer}
            animateTransitions={false}
            renderAboveThumbComponent={() => null}
          />

          {/* Min/Max labels */}
          <View style={styles.labels}>
            <AppText style={styles.labelText}>{formatDisplayValue(min)}</AppText>
          <AppText style={styles.labelText}>{formatDisplayValue(max)}</AppText>
        </View>
      </View>
    );
  }  // Range mode
  const leftTooltipPosition = calculateTooltipPosition(localRange[0]);
  const rightTooltipPosition = calculateTooltipPosition(localRange[1]);
  
  const rangePositions = calculateRangeTooltipPositions(
    leftTooltipPosition,
    rightTooltipPosition,
    leftTooltipWidth || 56,
    rightTooltipWidth || 56,
    containerWidth
  );
  
  return (
    <View 
      style={[styles.container, style]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      onStartShouldSetResponderCapture={() => {
        // Блокируем если это вертикальный скролл
        return isVerticalScrollRef.current;
      }}
      onTouchStart={(e) => {
        const touch = e.nativeEvent.touches[0];
        touchStartRef.current = {
          x: touch.pageX,
          y: touch.pageY,
          time: Date.now(),
        };
        isVerticalScrollRef.current = false;
      }}
      onTouchMove={(e) => {
        if (!touchStartRef.current) return;
        
        const touch = e.nativeEvent.touches[0];
        const deltaX = Math.abs(touch.pageX - touchStartRef.current.x);
        const deltaY = Math.abs(touch.pageY - touchStartRef.current.y);
        
        // Если вертикальное движение доминирует, помечаем как вертикальный скролл
        if (deltaY > 5 && deltaY > deltaX * 1.5) {
          isVerticalScrollRef.current = true;
        }
      }}
      onTouchEnd={() => {
        touchStartRef.current = null;
        isVerticalScrollRef.current = false;
      }}
    >
        {/* Tooltips для range режима с динамическими позициями */}
        <View style={styles.tooltipRow}>
          <View
            style={[
              styles.tooltip,
              styles.tooltipAbsolute,
              rangePositions.left,
            ]}
            onLayout={(e) => setLeftTooltipWidth(e.nativeEvent.layout.width)}
          >
            <AppText style={styles.tooltipText}>
              {formatDisplayValue(localRange[0])}
            </AppText>
          </View>
          <View
            style={[
              styles.tooltip,
              styles.tooltipAbsolute,
              rangePositions.right,
            ]}
            onLayout={(e) => setRightTooltipWidth(e.nativeEvent.layout.width)}
          >
            <AppText style={styles.tooltipText}>
              {formatDisplayValue(localRange[1])}
            </AppText>
          </View>
        </View>

        {/* Range Slider */}
        <Slider
          value={localRange}
          minimumValue={min}
          maximumValue={max}
          step={0} // Плавное движение без привязки к шагу во время перемещения
          onValueChange={handleValueChange}
          onSlidingComplete={handleSlidingComplete}
          minimumTrackTintColor="#302F2D"
          maximumTrackTintColor="#F4F3F0"
          thumbTintColor="#FFFFFF"
          thumbStyle={styles.thumb}
          trackStyle={styles.track}
          containerStyle={styles.sliderContainer}
          animateTransitions={false}
          renderAboveThumbComponent={() => null}
        />

        {/* Min/Max labels */}
        <View style={styles.labels}>
          <AppText style={styles.labelText}>{formatDisplayValue(min)}</AppText>
        <AppText style={styles.labelText}>{formatDisplayValue(max)}</AppText>
      </View>
    </View>
  );
};const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingBottom: 4,
    gap: 8,
  },
  sliderContainer: {
    height: 40,
    paddingHorizontal: 0,
  },
  track: {
    height: 4,
    borderRadius: 2,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#302F2D',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  tooltipRow: {
    flexDirection: 'row',
    height: 32,
    alignItems: 'flex-start',
    position: 'relative',
  },
  tooltip: {
    backgroundColor: '#302F2D',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#15181E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
    minWidth: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipAbsolute: {
    position: 'absolute',
  },
  tooltipText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 16.8,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  labelText: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 18,
    color: '#888684',
  },
});
