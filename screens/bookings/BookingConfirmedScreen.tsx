import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  PanResponder,
  type PanResponderGestureState,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/app-button';
import { AppText } from '@/components/ui/app-text';
import { AppToast } from '@/components/ui/app-toast';
import { Icon } from '@/components/ui/icon';
import { theme } from '@/constants/theme';
import type { MainStackParamList } from '@/navigation/types';
import { fetchBookingDetails } from '@/services/bookings-api';
import { bookingsStore } from '@/stores/bookings.store';
import {
  formatConfirmedBookingPrice,
  formatConfirmedBookingSummary,
} from '@/utils/booking-confirmed-summary';
import type { BookingDetails } from '@/types/bookings';

type Navigation = NativeStackNavigationProp<MainStackParamList, 'BookingConfirmed'>;
type BookingConfirmedRoute = RouteProp<MainStackParamList, 'BookingConfirmed'>;

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_OPEN_MS = 280;
const SHEET_EASING = Easing.out(Easing.cubic);
const SWIPE_CLOSE_DISTANCE = 100;
const SWIPE_CLOSE_VELOCITY = 500;
const SUCCESS_GREEN = '#22C55E';
const PRICE_GREEN = '#16A34A';
const CALENDAR_BLUE = theme.colors.accent.secondary;

const REMINDER_CHIPS = ['2 часа', '4 часа', '8 часов', '1 день', '2 дня'];
const COMING_SOON = 'Скоро';

export const BookingConfirmedScreen = observer(function BookingConfirmedScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<BookingConfirmedRoute>();
  const insets = useSafeAreaInsets();
  const bookingUuid = route.params.bookingUuid;
  const closingRef = useRef(false);
  const [remoteBooking, setRemoteBooking] = useState<BookingDetails | null>(null);
  const [soonVisible, setSoonVisible] = useState(false);

  const storeBooking =
    bookingsStore.selectedBooking?.uuid === bookingUuid
      ? bookingsStore.selectedBooking
      : bookingsStore.bookings.find((item) => item.uuid === bookingUuid);

  const booking = remoteBooking ?? storeBooking ?? null;

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  const showComingSoon = useCallback(() => {
    setSoonVisible(true);
  }, []);

  const goHome = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Home');
  }, [navigation]);

  const closeSheet = useCallback(() => {
    if (closingRef.current) {
      return;
    }

    closingRef.current = true;
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 220, easing: SHEET_EASING }, () => {
      runOnJS(goHome)();
    });
    backdropOpacity.value = withTiming(0, { duration: 180 });
  }, [backdropOpacity, goHome, translateY]);

  useEffect(() => {
    translateY.value = withTiming(0, { duration: SHEET_OPEN_MS, easing: SHEET_EASING });
    backdropOpacity.value = withTiming(1, { duration: 220 });
  }, [backdropOpacity, translateY]);

  useEffect(() => {
    let active = true;

    fetchBookingDetails(bookingUuid)
      .then((details) => {
        if (active) {
          setRemoteBooking(details);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [bookingUuid]);

  const handleDragRelease = useCallback(
    (gestureState: PanResponderGestureState) => {
      const shouldClose =
        gestureState.dy > SWIPE_CLOSE_DISTANCE || gestureState.vy > SWIPE_CLOSE_VELOCITY;

      if (shouldClose) {
        closeSheet();
        return;
      }

      translateY.value = withTiming(0, { duration: 180, easing: SHEET_EASING });
    },
    [closeSheet, translateY],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_, gestureState) =>
          gestureState.dy > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.value = gestureState.dy;
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          handleDragRelease(gestureState);
        },
        onPanResponderTerminate: () => {
          translateY.value = withTiming(0, { duration: 180, easing: SHEET_EASING });
        },
      }),
    [handleDragRelease, translateY],
  );

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const summary = booking
    ? formatConfirmedBookingSummary(booking)
    : 'Клиент может проходить к услуге';
  const price = formatConfirmedBookingPrice(booking?.total_cost);

  return (
    <View style={styles.root}>
      <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet}>
        <Animated.View style={[styles.backdrop, backdropStyle]} />
      </Pressable>

      <Animated.View style={[styles.sheet, sheetStyle]} {...panResponder.panHandlers}>
        <View style={styles.handleHeader}>
          <View style={styles.handle} />
        </View>

        <View style={[styles.content, { paddingBottom: insets.bottom + 12 }]}>
          <AppText weight="semiBold" style={styles.title}>
            Запись подтверждена!
          </AppText>

          <View style={styles.check}>
            <Icon name="check" size={28} color={theme.colors.gray[50]} />
          </View>

          <AppText weight="regular" style={styles.summary}>
            {summary}
          </AppText>

          {price ? (
            <AppText weight="regular" style={styles.priceLine}>
              Стоимость заказа:{' '}
              <AppText weight="medium" style={styles.price}>
                {price}
              </AppText>
            </AppText>
          ) : null}

          <AppButton
            label="На главную"
            onPress={closeSheet}
            style={styles.homeButton}
          />

          <View style={styles.remindBlock}>
            <View style={styles.remindLabel}>
              <Icon name="notification" size={16} color={theme.colors.gray[800]} />
              <AppText weight="regular" style={styles.remindText}>
                Напомнить в SMS за:
              </AppText>
            </View>

            <View style={styles.chips}>
              {REMINDER_CHIPS.map((label) => (
                <Pressable
                  key={label}
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  onPress={showComingSoon}
                  style={styles.chip}>
                  <AppText weight="regular" style={styles.chipText}>
                    {label}
                  </AppText>
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Добавить в календарь"
            onPress={showComingSoon}
            style={styles.calendarButton}>
            <Icon name="calendar" size={16} color={CALENDAR_BLUE} />
            <AppText weight="regular" style={styles.calendarLabel}>
              Добавить в календарь
            </AppText>
          </Pressable>
        </View>

        <AppToast
          visible={soonVisible}
          message={COMING_SOON}
          onHide={() => setSoonVisible(false)}
        />
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(48, 47, 45, 0.28)',
  },
  sheet: {
    backgroundColor: theme.colors.gray[50],
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  handleHeader: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 39,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#E7E7E7',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  title: {
    fontSize: 22,
    lineHeight: 26,
    textAlign: 'center',
    color: theme.colors.gray[900],
  },
  check: {
    marginTop: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: SUCCESS_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    marginTop: 20,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    color: theme.colors.gray[900],
  },
  priceLine: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    color: theme.colors.gray[900],
  },
  price: {
    fontSize: 16,
    lineHeight: 22,
    color: PRICE_GREEN,
  },
  homeButton: {
    marginTop: 24,
    width: 220,
    height: 52,
    borderRadius: 26,
  },
  remindBlock: {
    marginTop: 28,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  remindLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  remindText: {
    fontSize: 14,
    lineHeight: 18,
    color: theme.colors.gray[900],
  },
  chips: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F4F3F0',
  },
  chipText: {
    fontSize: 14,
    lineHeight: 17,
    color: theme.colors.gray[800],
  },
  calendarButton: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calendarLabel: {
    fontSize: 16,
    lineHeight: 20,
    color: CALENDAR_BLUE,
  },
});
