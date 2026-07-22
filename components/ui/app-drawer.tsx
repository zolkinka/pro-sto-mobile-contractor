import React, { ReactNode, useCallback, useEffect, useMemo } from 'react';
import {
  Dimensions,
  Modal,
  PanResponder,
  type PanResponderGestureState,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
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
import { Icon } from './icon';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DRAWER_HEIGHT = SCREEN_HEIGHT * 0.92; // 92% от высоты экрана
const SWIPE_CLOSE_DISTANCE = 100;
const SWIPE_CLOSE_VELOCITY = 500;

export interface AppDrawerProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode; // Добавляем опциональный футер
  backgroundColor?: string;
  headerVariant?: 'close' | 'handle';
  size?: 'full' | 'auto';
}

export const AppDrawer: React.FC<AppDrawerProps> = ({
  visible,
  onClose,
  title,
  children,
  footer,
  backgroundColor = '#F9F8F5',
  headerVariant = 'close',
  size = 'full',
}) => {
  const insets = useSafeAreaInsets();
  const isAutoSize = size === 'auto';
  // Some Android devices (e.g. MIUI) under-report bottom inset with edge-to-edge.
  const footerBottomPadding = Math.max(insets.bottom + 16, 48);
  const scrollBottomPadding = isAutoSize
    ? footer
      ? 8
      : footerBottomPadding
    : 100 + footerBottomPadding;
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

  const handleClose = useCallback(() => {
    translateY.value = withTiming(DRAWER_HEIGHT, { duration: 250 }, () => {
      runOnJS(onClose)();
    });
    backdropOpacity.value = withTiming(0, { duration: 250 });
  }, [backdropOpacity, onClose, translateY]);

  const handleDragRelease = useCallback(
    (gestureState: PanResponderGestureState) => {
      const shouldClose =
        gestureState.dy > SWIPE_CLOSE_DISTANCE ||
        gestureState.vy > SWIPE_CLOSE_VELOCITY;

      if (shouldClose) {
        handleClose();
        return;
      }

      translateY.value = withSpring(0);
    },
    [handleClose, translateY],
  );

  const handlePanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: (
          _,
          gestureState: PanResponderGestureState,
        ) =>
          Math.abs(gestureState.dy) > 2 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
          if (gestureState.dy > 0) {
            translateY.value = gestureState.dy;
          }
        },
        onPanResponderRelease: (_, gestureState: PanResponderGestureState) => {
          handleDragRelease(gestureState);
        },
        onPanResponderTerminate: () => {
          translateY.value = withSpring(0);
        },
      }),
    [handleDragRelease, translateY],
  );

  // Gesture для свайпа вниз от handle — не зависит от позиции ScrollView
  const handleGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > SWIPE_CLOSE_DISTANCE || event.velocityY > SWIPE_CLOSE_VELOCITY) {
        runOnJS(handleClose)();
      } else {
        translateY.value = withSpring(0);
      }
    })
    .simultaneousWithExternalGesture();

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
        <Animated.View
          style={[
            styles.drawer,
            isAutoSize && styles.drawerAuto,
            { backgroundColor },
            drawerStyle,
          ]}
        >
          {/* Header with gesture - свайп от handle всегда работает */}
          {headerVariant === 'handle' ? (
            Platform.OS === 'ios' ? (
              <GestureDetector gesture={handleGesture}>
                <Animated.View
                  style={[
                    styles.handleHeader,
                    { backgroundColor },
                  ]}
                  collapsable={false}
                >
                  <View style={styles.dragHandle} />
                </Animated.View>
              </GestureDetector>
            ) : (
              <View
                style={[
                  styles.handleHeader,
                  styles.handleHeaderAndroid,
                  { backgroundColor },
                ]}
                collapsable={false}
                {...handlePanResponder.panHandlers}
              >
                <View style={styles.dragHandle} />
              </View>
            )
          ) : (
            <View style={[styles.header, { backgroundColor }]}>
              {title && <AppText style={styles.title}>{title}</AppText>}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="close" size={24} color="#302F2D" />
              </TouchableOpacity>
            </View>
          )}

          {/* Content с отслеживанием скролла */}
          <Animated.ScrollView
            style={isAutoSize ? styles.scrollViewAuto : styles.scrollView}
            contentContainerStyle={[
              styles.scrollViewContent,
              headerVariant === 'handle' && styles.scrollViewContentWithHandle,
              isAutoSize && styles.scrollViewContentAuto,
              { paddingBottom: scrollBottomPadding },
            ]}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            bounces={!isAutoSize}
          >
            {children}
          </Animated.ScrollView>

          {footer && (
            <View
              style={[
                styles.footer,
                isAutoSize && styles.footerAuto,
                { paddingBottom: footerBottomPadding },
              ]}
            >
              {footer}
            </View>
          )}
        </Animated.View>
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
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.03,
    shadowRadius: 15,
    elevation: 10,
  },
  drawerAuto: {
    height: undefined,
    maxHeight: DRAWER_HEIGHT,
  },
  header: {
    paddingTop: 14,
    paddingBottom: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  handleHeader: {
    width: '100%',
    paddingTop: 20,
    paddingBottom: 12,
    alignItems: 'center',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  handleHeaderAndroid: {
    paddingTop: 24,
    paddingBottom: 12,
  },
  dragHandle: {
    width: 39,
    height: 5,
    backgroundColor: '#E7E7E7',
    borderRadius: 5,
    alignSelf: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 21.6,
    color: '#302F2D',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewAuto: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollViewContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 100, // Для кнопки внизу
  },
  scrollViewContentWithHandle: {
    paddingTop: 8,
  },
  scrollViewContentAuto: {
    flexGrow: 0,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  footerAuto: {
    position: 'relative',
    paddingTop: 8,
  },
});
