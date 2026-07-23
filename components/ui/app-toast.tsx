import React, { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';

export interface AppToastProps {
  visible: boolean;
  message: string;
  duration?: number;
  onHide?: () => void;
}

export const AppToast: React.FC<AppToastProps> = ({ 
  visible, 
  message, 
  duration = 2000,
  onHide 
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  const hideToast = useCallback(() => {
    onHide?.();
  }, [onHide]);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withTiming(0, { duration: 200 });

      const timer = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 200 });
        translateY.value = withTiming(20, { duration: 200 });
        
        setTimeout(() => {
          hideToast();
        }, 200);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      opacity.value = 0;
      translateY.value = 20;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, duration, hideToast]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.toast, animatedStyle]}>
        <AppText style={styles.message}>{message}</AppText>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    backgroundColor: '#302F2D',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 16.8,
  },
});
