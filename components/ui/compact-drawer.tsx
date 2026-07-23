import React, { ReactNode, useEffect } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { AppText } from '@/components/ui/app-text';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export interface CompactDrawerProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export const CompactDrawer: React.FC<CompactDrawerProps> = ({
  visible,
  onClose,
  title,
  children,
  footer,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { 
        duration: 300,
      });
      backdropOpacity.value = withTiming(1, { duration: 250 });
    } else {
      // Мгновенное закрытие без анимации
      translateY.value = SCREEN_HEIGHT;
      backdropOpacity.value = 0;
    }
  }, [visible, translateY, backdropOpacity]);

  const handleClose = () => {
    // Мгновенное закрытие - просто вызываем onClose
    // React Native сам скроет клавиатуру при размонтировании компонента
    onClose();
  };

  // Gesture для свайпа вниз
  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100 || event.velocityY > 500) {
        runOnJS(handleClose)();
      } else {
        translateY.value = withSpring(0);
      }
    });

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </Pressable>

        {/* Drawer */}
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.keyboardAvoidingView}
        >
          <GestureDetector gesture={gesture}>
            <Animated.View style={[styles.drawer, drawerStyle]}>
              {/* Header */}
              <View style={styles.header}>
                {/* Handle bar */}
                <View style={styles.handleBar} />
                {title && (
                  <AppText style={styles.title}>{title}</AppText>
                )}
              </View>

              {/* Content */}
              <View style={[styles.content, { paddingBottom: Math.max(16 + insets.bottom, 32) }]}>
                {children}
              </View>

              {/* Footer */}
              {footer && (
                <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                  {footer}
                </View>
              )}
            </Animated.View>
          </GestureDetector>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(83, 81, 79, 0.2)',
  },
  keyboardAvoidingView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
  },
  drawer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000000',
    shadowOffset: { width: 8, height: -13 },
    shadowOpacity: 0.03,
    shadowRadius: 15,
    elevation: 10,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  handleBar: {
    width: 39,
    height: 5,
    backgroundColor: '#E7E7E7',
    borderRadius: 5,
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 16.8,
    color: '#53514F',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 16,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
});
