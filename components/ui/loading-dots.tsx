import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface LoadingDotsProps {
  size?: number;
}

/**
 * Компонент анимированных точек загрузки
 * Три точки поочередно увеличиваются и меняют цвет
 */
export const LoadingDots: React.FC<LoadingDotsProps> = ({ size = 12 }) => {
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Анимация для каждой точки: увеличение -> уменьшение -> пауза
    const animateDot = (animValue: Animated.Value) => {
      return Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true, // Используем native driver для transform
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]);
    };

    // Последовательная анимация точек с паузой между ними
    const sequenceAnimation = Animated.loop(
      Animated.sequence([
        animateDot(dot1Anim),
        animateDot(dot2Anim),
        animateDot(dot3Anim),
      ])
    );

    sequenceAnimation.start();

    return () => {
      sequenceAnimation.stop();
    };
  }, [dot1Anim, dot2Anim, dot3Anim]);

  const getDotStyle = (animValue: Animated.Value) => ({
    transform: [
      {
        scale: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.4], // Увеличение на 40%
        }),
      },
    ],
    opacity: animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1], // Изменение прозрачности для визуального эффекта
    }),
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.dot, { width: size, height: size }, getDotStyle(dot1Anim)]} />
      <Animated.View style={[styles.dot, { width: size, height: size }, getDotStyle(dot2Anim)]} />
      <Animated.View style={[styles.dot, { width: size, height: size }, getDotStyle(dot3Anim)]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 20, // Фиксированная высота контейнера
  },
  dot: {
    borderRadius: 12,
    backgroundColor: '#302F2D', // Темный цвет как на макете
  },
});
