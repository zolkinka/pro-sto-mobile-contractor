import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookingClientSection } from '@/components/bookings/booking-client-section';
import { BookingCommentSection } from '@/components/bookings/booking-comment-section';
import { BookingServicesSection } from '@/components/bookings/booking-services-section';
import {
  getBottomOverlayScrollPadding,
  StickyBottomOverlay,
} from '@/components/bookings/sticky-bottom-overlay';
import { AppButton } from '@/components/ui/app-button';
import { ErrorStateView } from '@/components/ui/error-state-view';
import { LoadingStateView } from '@/components/ui/loading-state-view';
import { Icon } from '@/components/ui/icon';
import {
  BOOKING_CONTENT_WIDTH,
  BOTTOM_OVERLAY_CONTENT_GAP,
  ICON_DIRECTION_LEFT_COLOR,
  ORDER_DETAILS_FOOTER_CONTENT_HEIGHT,
} from '@/constants/bookings';
import { theme } from '@/constants/theme';
import type { MainStackParamList } from '@/navigation/types';
import { bookingsStore } from '@/stores/bookings.store';
import { canConfirmBooking } from '@/utils/booking-confirm-actions';

type Navigation = NativeStackNavigationProp<MainStackParamList, 'OrderDetails'>;
type OrderDetailsRoute = RouteProp<MainStackParamList, 'OrderDetails'>;

export const OrderDetailsScreen = observer(function OrderDetailsScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<OrderDetailsRoute>();
  const insets = useSafeAreaInsets();
  const { bookingUuid, postOrderNumber } = route.params;

  useEffect(() => {
    bookingsStore.openBookingDetails(bookingUuid, { postOrderNumber }).catch(() => undefined);

    return () => {
      bookingsStore.clearSelectedBooking();
    };
  }, [bookingUuid, postOrderNumber]);

  const booking = bookingsStore.selectedBookingView;
  const services = bookingsStore.getServiceViews(bookingsStore.selectedBooking);
  const showFooter = Boolean(booking && canConfirmBooking(booking.status));
  const scrollBottomPadding = showFooter
    ? getBottomOverlayScrollPadding(insets.bottom, ORDER_DETAILS_FOOTER_CONTENT_HEIGHT, 'solidFooter')
    : 24;

  const handleRetry = () => {
    bookingsStore.clearError();
    bookingsStore.openBookingDetails(bookingUuid, { postOrderNumber }).catch(() => undefined);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} hitSlop={12} style={styles.backButton}>
          <Icon name="direction-left" size={24} color={ICON_DIRECTION_LEFT_COLOR} />
        </Pressable>
      </View>

      {bookingsStore.isLoadingDetails && !booking ? (
        <LoadingStateView />
      ) : bookingsStore.error && !booking ? (
        <ErrorStateView message={bookingsStore.error} onRetry={handleRetry} />
      ) : booking ? (
        <View style={styles.body}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollBottomPadding }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled>
            <BookingClientSection booking={booking} />
            <BookingServicesSection services={services} />
            <BookingCommentSection comment={booking.client_comment} />
          </ScrollView>

          {showFooter ? (
            <StickyBottomOverlay
              variant="solidFooter"
              contentGap={BOTTOM_OVERLAY_CONTENT_GAP}
              contentHeight={ORDER_DETAILS_FOOTER_CONTENT_HEIGHT}>
              <AppButton
                label="Подтвердить через QR"
                onPress={() => navigation.navigate('QrScan', { bookingUuid })}
                rightIcon="qr-code"
                style={styles.primaryButton}
              />
              <AppButton
                label="Подтвердить по 4-х значному коду заказа"
                onPress={() => {
                  navigation.navigate('BookingCode', { bookingUuid });
                }}
                variant="secondary"
                style={styles.codeButton}
              />
            </StickyBottomOverlay>
          ) : null}
        </View>
      ) : null}
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.gray[50],
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
    minHeight: 0,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 0,
    gap: 24,
  },
  primaryButton: {
    width: BOOKING_CONTENT_WIDTH,
    height: 50,
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 20,
    paddingRight: 20,
  },
  codeButton: {
    width: BOOKING_CONTENT_WIDTH,
    height: 52,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.gray[50],
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
});
