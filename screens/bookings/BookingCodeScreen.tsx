import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/app-button';
import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { theme } from '@/constants/theme';
import type { MainStackParamList } from '@/navigation/types';
import { bookingsStore } from '@/stores/bookings.store';
import { isConfirmationCode } from '@/utils/booking-qr-payload';

type Navigation = NativeStackNavigationProp<MainStackParamList, 'BookingCode'>;
type BookingCodeRoute = RouteProp<MainStackParamList, 'BookingCode'>;

const CODE_LENGTH = 4;
const ERROR_COLOR = '#D8182E';
const MISSING_BOOKING_MESSAGE = 'Откройте карточку записи, чтобы ввести код';

export function BookingCodeScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<BookingCodeRoute>();
  const bookingUuid = route.params?.bookingUuid;
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputsRef = useRef<Array<TextInput | null>>([]);
  const submittingRef = useRef(false);

  const submitCode = async (code: string) => {
    if (!isConfirmationCode(code) || submittingRef.current) {
      return;
    }

    if (!bookingUuid) {
      setErrorMessage(MISSING_BOOKING_MESSAGE);
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await bookingsStore.confirmBooking(bookingUuid, code);

    if (result.ok) {
      navigation.navigate('BookingConfirmed', { bookingUuid });
      return;
    }

    submittingRef.current = false;
    setIsSubmitting(false);
    setErrorMessage(result.message);
    setDigits(Array(CODE_LENGTH).fill(''));
    inputsRef.current[0]?.focus();
  };

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setErrorMessage(null);

    if (digit && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    const code = next.join('');

    if (code.length === CODE_LENGTH) {
      submitCode(code).catch(() => undefined);
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backButton}>
          <Icon name="direction-left" size={24} color={theme.colors.gray[900]} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.copy}>
          <AppText weight="medium" style={styles.title}>
            Введите 4-х значный код заказа для начала мойки
          </AppText>
          <AppText weight="regular" style={styles.subtitle}>
            Он на главном экране или в истории заказов клиента
          </AppText>
        </View>

        <View style={styles.codeRow}>
          {digits.map((digit, index) => (
            <TextInput
              key={index}
              ref={(node) => {
                inputsRef.current[index] = node;
              }}
              value={digit}
              onChangeText={(value) => handleChange(index, value)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
              keyboardType="number-pad"
              maxLength={1}
              editable={!isSubmitting}
              style={[styles.input, errorMessage ? styles.inputError : null]}
              accessibilityLabel={`Цифра ${index + 1}`}
            />
          ))}
        </View>

        {errorMessage ? (
          <AppText weight="regular" style={styles.error}>
            {errorMessage}
          </AppText>
        ) : null}
      </View>

      <AppButton
        label="Подтвердить через QR"
        variant="secondary"
        onPress={() => navigation.navigate('QrScan', { bookingUuid })}
        style={styles.qrButton}
      />
    </SafeAreaView>
  );
}

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
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  input: {
    width: 59,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D4D4D4',
    backgroundColor: '#F9F8F5',
    textAlign: 'center',
    fontSize: 18,
    color: theme.colors.gray[900],
    fontFamily: theme.fonts.regular,
  },
  inputError: {
    borderColor: ERROR_COLOR,
  },
  error: {
    fontSize: 15,
    lineHeight: 18,
    color: ERROR_COLOR,
    textAlign: 'center',
  },
  qrButton: {
    marginTop: 'auto',
    marginBottom: 20,
    width: '100%',
    height: 52,
    backgroundColor: '#E7E5E4',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
});
