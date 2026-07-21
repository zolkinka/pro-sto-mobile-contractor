import React, { useEffect, useRef } from 'react';
import { Animated, DimensionValue, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Компонент скелетон-анимации для загрузки контента
 * Показывает пульсирующую анимацию в стиле загрузки
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
};

/**
 * Скелетон для карточки/контейнера изображения авто
 */
interface CarImageSkeletonProps {
  style?: StyleProp<ViewStyle>;
}

export const CarImageSkeleton: React.FC<CarImageSkeletonProps> = ({ style }) => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View style={[styles.carImageSkeleton, style]}>
      {/* Фоновая анимация */}
      <Animated.View style={[styles.carImageSkeletonBg, { opacity: pulseAnim }]} />
      
      {/* Иконка авто в центре */}
      <Animated.View style={[styles.carIconPlaceholder, { opacity: pulseAnim }]}>
        <View style={styles.carIconShape} />
      </Animated.View>
      
      {/* Имитация бейджа с названием */}
      <View style={styles.skeletonBadgeTop}>
        <Animated.View style={[styles.skeletonBadge, { opacity: pulseAnim }]} />
      </View>
      
      {/* Имитация номера */}
      <View style={styles.skeletonBadgeBottom}>
        <Animated.View style={[styles.skeletonBadgeSmall, { opacity: pulseAnim }]} />
      </View>
    </View>
  );
};

/**
 * Полноценный скелетон для карточки авто (как на профиле)
 * Имеет фиксированные размеры как у CarCard
 */
export const CarCardSkeleton: React.FC = () => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.carCardSkeleton}>
      {/* Фоновая анимация */}
      <Animated.View style={[styles.carCardSkeletonBg, { opacity: pulseAnim }]} />
      
      {/* Иконка авто в центре */}
      <Animated.View style={[styles.carCardIconPlaceholder, { opacity: pulseAnim }]}>
        <View style={styles.carCardIconShape} />
      </Animated.View>
      
      {/* Имитация бейджа с названием */}
      <View style={styles.carCardBadgeTop}>
        <Animated.View style={[styles.carCardBadge, { opacity: pulseAnim }]} />
      </View>
      
      {/* Имитация номера */}
      <View style={styles.carCardBadgeBottom}>
        <Animated.View style={[styles.carCardBadgeSmall, { opacity: pulseAnim }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E5E4E2',
  },
  carImageSkeleton: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: '#E5E4E2',
    overflow: 'hidden',
    position: 'relative',
  },
  carImageSkeletonBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#D9D8D6',
  },
  carIconPlaceholder: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -40 }, { translateY: -25 }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  carIconShape: {
    width: 80,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#C5C4C2',
  },
  skeletonBadgeTop: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  skeletonBadge: {
    width: 100,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#C5C4C2',
  },
  skeletonBadgeBottom: {
    position: 'absolute',
    bottom: 12,
    left: 12,
  },
  skeletonBadgeSmall: {
    width: 80,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#C5C4C2',
  },
  // CarCardSkeleton styles (фиксированные размеры как у CarCard: 307x154)
  carCardSkeleton: {
    width: 307,
    height: 154,
    borderRadius: 24,
    backgroundColor: '#E5E4E2',
    overflow: 'hidden',
    position: 'relative',
  },
  carCardSkeletonBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#D9D8D6',
  },
  carCardIconPlaceholder: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -30 }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  carCardIconShape: {
    width: 100,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#C5C4C2',
  },
  carCardBadgeTop: {
    position: 'absolute',
    top: 8,
    left: 12,
  },
  carCardBadge: {
    width: 110,
    height: 31,
    borderRadius: 20,
    backgroundColor: '#C5C4C2',
  },
  carCardBadgeBottom: {
    position: 'absolute',
    bottom: 12,
    left: 12,
  },
  carCardBadgeSmall: {
    width: 90,
    height: 26,
    borderRadius: 20,
    backgroundColor: '#C5C4C2',
  },
});
