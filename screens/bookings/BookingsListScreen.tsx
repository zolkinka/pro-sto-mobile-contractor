import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProStoLogo } from '@/components/auth/prosto-logo';
import { BookingCard } from '@/components/bookings/booking-card';
import { BookingDatePicker } from '@/components/bookings/booking-date-picker';
import { BookingsListSkeleton } from '@/components/bookings/bookings-list-skeleton';
import { MainBottomBar, type MainBottomTab } from '@/components/bookings/main-bottom-bar';
import {
  getBottomOverlayScrollPadding,
  StickyBottomOverlay,
} from '@/components/bookings/sticky-bottom-overlay';
import { AppText } from '@/components/ui/app-text';
import { EmptyStateView } from '@/components/ui/empty-state-view';
import { ErrorStateView } from '@/components/ui/error-state-view';
import { LoadingStateView } from '@/components/ui/loading-state-view';
import { UI_STATE_LABELS } from '@/constants/ui-states';
import { theme } from '@/constants/theme';
import type { MainStackParamList } from '@/navigation/types';
import { authStore } from '@/stores/auth.store';
import { bookingsStore } from '@/stores/bookings.store';
import { formatBookingDayLabel, isSameDay } from '@/utils/booking-date';

type Navigation = NativeStackNavigationProp<MainStackParamList, 'Home'>;

export const BookingsListScreen = observer(function BookingsListScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const listScrollBottomPadding = getBottomOverlayScrollPadding(insets.bottom, 56, 'floating');

  useFocusEffect(
    useCallback(() => {
      bookingsStore.setServiceCenterUuid(authStore.user?.serviceCenterUuid ?? null);
      bookingsStore.fetchBookings().catch(() => undefined);
    }, []),
  );

  const handleBookingPress = (bookingUuid: string, postOrderNumber?: number | null) => {
    navigation.navigate('OrderDetails', {
      bookingUuid,
      postOrderNumber: postOrderNumber ?? null,
    });
  };

  const handleRetry = () => {
    bookingsStore.clearError();
    bookingsStore.fetchBookings().catch(() => undefined);
  };

  const handleDateConfirm = (date: Date) => {
    if (isSameDay(date, bookingsStore.selectedDate)) {
      return;
    }

    bookingsStore.setSelectedDate(date);
    bookingsStore.fetchBookings().catch(() => undefined);
  };

  const handleBottomTabPress = (tab: MainBottomTab) => {
    if (tab === 'bookings') {
      return;
    }

    if (tab === 'qr') {
      navigation.navigate('QrScan', {});
      return;
    }

    Alert.alert(UI_STATE_LABELS.comingSoonTitle, UI_STATE_LABELS.profileComingSoonMessage);
  };

  const dateLabel = formatBookingDayLabel(bookingsStore.selectedDate);
  const bookings = bookingsStore.sortedBookings;
  const nearestDateLabel = bookingsStore.nearestBookingDate
    ? formatBookingDayLabel(bookingsStore.nearestBookingDate)
    : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => setDatePickerVisible(true)}
          style={({ pressed }) => [styles.datePill, pressed && styles.datePillPressed]}
          accessibilityRole="button"
          accessibilityLabel={`Выбранная дата: ${dateLabel}`}>
          <AppText weight="semiBold" style={styles.dateText}>
            {dateLabel}
          </AppText>
        </Pressable>
        <ProStoLogo />
      </View>

      <View style={styles.body}>
        <View style={styles.content}>
          {bookingsStore.isLoadingList && bookings.length === 0 ? (
            <LoadingStateView variant="content">
              <BookingsListSkeleton />
            </LoadingStateView>
          ) : bookingsStore.error && bookings.length === 0 ? (
            <ErrorStateView message={bookingsStore.error} onRetry={handleRetry} />
          ) : bookings.length === 0 ? (
            <EmptyStateView
              title={UI_STATE_LABELS.emptyBookingsTitle}
              description={
                nearestDateLabel ? `Ближайшие записи: ${nearestDateLabel}` : undefined
              }
              actionLabel={nearestDateLabel ? `Перейти на ${nearestDateLabel}` : undefined}
              onActionPress={
                bookingsStore.nearestBookingDate
                  ? () => bookingsStore.goToNearestBookingDate()
                  : undefined
              }
            />
          ) : (
            <ScrollView
              style={styles.listScroll}
              contentContainerStyle={[
                styles.listContent,
                { paddingBottom: listScrollBottomPadding },
              ]}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled>
              {bookings.map((booking) => (
                <BookingCard
                  key={booking.uuid}
                  booking={booking}
                  backgroundColor={bookingsStore.getCardBackgroundColor(booking.status)}
                  onPress={() =>
                    handleBookingPress(booking.uuid, booking.post?.orderNumber ?? null)
                  }
                />
              ))}
            </ScrollView>
          )}
        </View>

        <StickyBottomOverlay variant="floating" bottomPadding={16}>
          <MainBottomBar activeTab="bookings" onTabPress={handleBottomTabPress} />
        </StickyBottomOverlay>
      </View>

      <BookingDatePicker
        visible={isDatePickerVisible}
        selectedDate={bookingsStore.selectedDate}
        onClose={() => setDatePickerVisible(false)}
        onConfirm={handleDateConfirm}
      />
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  datePill: {
    backgroundColor: theme.colors.gray[900],
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  datePillPressed: {
    opacity: 0.85,
  },
  dateText: {
    color: theme.colors.gray[50],
    fontSize: 14,
  },
  body: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  listScroll: {
    flex: 1,
    minHeight: 0,
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
});
