import React, { ReactNode, useEffect } from 'react';
import {
  View,
  Modal,
  Pressable,
  StyleSheet,
  Dimensions,
  ScrollView,
  Text,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DRAWER_HEIGHT = SCREEN_HEIGHT * 0.92; // 92% от высоты экрана

export interface AppDrawerProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode; // Добавляем опциональный футер
}

export const AppDrawer: React.FC<AppDrawerProps> = ({
  visible,
  onClose,
  title,
  children,
  footer,
}) => {
  const translateY = useSharedValue(DRAWER_HEIGHT); // Начинаем с высоты drawer
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0);
      backdropOpacity.value = withTiming(1, { duration: 250 });
    } else {
      translateY.value = withTiming(DRAWER_HEIGHT, { duration: 250 });
      backdropOpacity.value = withTiming(0, { duration: 250 });
    }
  }, [visible, translateY, backdropOpacity]);

  const handleClose = () => {
    translateY.value = withTiming(DRAWER_HEIGHT, { duration: 250 }, () => {
      runOnJS(onClose)();
    });
    backdropOpacity.value = withTiming(0, { duration: 250 });
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
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.drawer, drawerStyle]}>
            {/* Header */}
            <View style={styles.header}>
              {/* Handle bar - полоска для свайпа */}
              <View style={styles.handleBar} />
              {title && (
                <Text style={styles.title}>{title}</Text>
              )}
            </View>

            {/* Content */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>

            {/* Footer (фиксированный внизу) */}
            {footer && (
              <View style={styles.footer}>
                {footer}
              </View>
            )}
          </Animated.View>
        </GestureDetector>
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
    backgroundColor: 'rgba(83, 81, 79, 0.05)',
  },
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: DRAWER_HEIGHT,
    backgroundColor: '#F9F8F5',
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
    paddingBottom: 4,
    alignItems: 'center',
    backgroundColor: '#F9F8F5',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  handleBar: {
    width: 39,
    height: 5,
    backgroundColor: '#E7E7E7',
    borderRadius: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 19.2,
    color: '#302F2D',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 100, // Для кнопки внизу
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F9F8F5',
  },
});
