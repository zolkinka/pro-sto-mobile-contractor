import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { theme } from '@/constants/theme';
import type { MainStackParamList } from '@/navigation/types';
import { bookingsStore } from '@/stores/bookings.store';
import { formatPhone, isValidPhone, phonesMatch } from '@/utils/phone-mask';

type Navigation = NativeStackNavigationProp<MainStackParamList, 'BookingPhone'>;
type BookingPhoneRoute = RouteProp<MainStackParamList, 'BookingPhone'>;

const MISMATCH_MESSAGE = 'Номер не совпадает с записью';

export const BookingPhoneScreen = observer(function BookingPhoneScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<BookingPhoneRoute>();
  const bookingUuid = route.params.bookingUuid;
  const [phone, setPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const expectedPhone =
    bookingsStore.selectedBooking?.uuid === bookingUuid
      ? bookingsStore.selectedBooking.client.phone
      : bookingsStore.bookings.find((item) => item.uuid === bookingUuid)?.client.phone;

  const handleSubmit = () => {
    if (!isValidPhone(phone)) {
      setErrorMessage('Введите номер полностью');
      return;
    }

    if (!expectedPhone || !phonesMatch(phone, expectedPhone)) {
      setErrorMessage(MISMATCH_MESSAGE);
      return;
    }

    navigation.navigate('BookingConfirmed', { bookingUuid });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Назад">
          <Icon name="chevron-left" size={24} color={theme.colors.gray[900]} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.copy}>
          <AppText weight="medium" style={styles.title}>
            Введите номер телефона клиента
          </AppText>
          <AppText weight="regular" style={styles.subtitle}>
            Клиент называет номер из приложения. Отдельный код по SMS не приходит — сверяется номер из записи
          </AppText>
        </View>

        <AppInput
          value={phone}
          onChangeText={(text) => {
            setPhone(formatPhone(text));
            setErrorMessage(null);
          }}
          placeholder="+7"
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          maxLength={18}
          error={errorMessage ?? undefined}
        />
      </View>

      <AppButton
        label="Подтвердить"
        onPress={handleSubmit}
        disabled={!isValidPhone(phone)}
        style={styles.submitButton}
      />
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.gray[50],
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 2,
  },
  backButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingTop: 24,
    gap: 24,
  },
  copy: {
    gap: 8,
  },
  title: {
    fontSize: 24,
    lineHeight: 28.8,
    textAlign: 'center',
    color: theme.colors.gray[900],
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 19.2,
    textAlign: 'center',
    color: theme.colors.gray[900],
  },
  submitButton: {
    marginTop: 'auto',
    marginBottom: 20,
    width: '100%',
    height: 52,
  },
});
