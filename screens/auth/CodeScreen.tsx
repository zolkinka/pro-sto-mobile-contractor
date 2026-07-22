import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { AppText } from '@/components/ui/app-text';
import { AppTextInput } from '@/components/ui/app-text-input';
import { OTP_RESEND_SECONDS } from '@/constants/config';
import { theme } from '@/constants/theme';
import type { AuthStackParamList } from '@/navigation/types';
import { authStore } from '@/stores/auth.store';
import { formatPhone } from '@/utils/phone-mask';

type CodeScreenNavigation = NativeStackNavigationProp<AuthStackParamList, 'Code'>;

export const CodeScreen = observer(function CodeScreen() {
  const navigation = useNavigation<CodeScreenNavigation>();
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(OTP_RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const iosHiddenInputRef = useRef<TextInput | null>(null);
  const isSubmittingRef = useRef(false);
  const isIOS = Platform.OS === 'ios';

  const formattedPhone = authStore.phone ? formatPhone(authStore.phone) : '';

  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleSubmitCode = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 4 || authStore.isLoading || isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;

    try {
      const success = await authStore.login(fullCode);

      if (!success) {
        setCode(['', '', '', '']);
        if (isIOS) {
          iosHiddenInputRef.current?.focus();
        } else {
          inputRefs.current[0]?.focus();
        }
      }
    } finally {
      isSubmittingRef.current = false;
    }
  };

  useEffect(() => {
    if (code.join('').length === 4 && !authStore.isLoading && !isSubmittingRef.current) {
      handleSubmitCode().catch(() => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, authStore.isLoading]);

  const handleIOSCodeChange = (value: string) => {
    const digits = value.replace(/[^0-9]/g, '').slice(0, 4);
    const newCode = ['', '', '', ''];

    for (let i = 0; i < digits.length; i += 1) {
      newCode[i] = digits[i];
    }

    setCode(newCode);
    authStore.clearError();
  };

  const handleCodeChange = (value: string, index: number) => {
    authStore.clearError();

    if (value === '') {
      setCode((prev) => {
        const newCode = [...prev];
        newCode[index] = '';
        return newCode;
      });

      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      return;
    }

    const digits = value.replace(/[^0-9]/g, '');

    if (digits.length > 1) {
      const newCode = ['', '', '', ''];
      for (let i = 0; i < Math.min(digits.length, 4); i += 1) {
        newCode[i] = digits[i];
      }
      setCode(newCode);
      inputRefs.current[3]?.focus();
      return;
    }

    if (digits.length === 1) {
      setCode((prev) => {
        const newCode = [...prev];
        newCode[index] = digits[0];
        return newCode;
      });

      if (index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && code[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = async () => {
    if (!canResend || !authStore.phone) {
      return;
    }

    setCanResend(false);
    setTimer(OTP_RESEND_SECONDS);
    setCode(['', '', '', '']);

    const success = await authStore.sendCode(authStore.phone);

    if (!success) {
      setCanResend(true);
      setTimer(0);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={12}>
          <Icon name="arrow-left" size={24} color={theme.colors.gray[900]} />
        </Pressable>

        <View style={styles.authContainer}>
          <View style={styles.header}>
            <AppText weight="medium" style={styles.title}>Введите код из СМС</AppText>
            <AppText style={styles.subtitle}>
              Отправили на номер <AppText weight="medium" style={styles.phone}>{formattedPhone}</AppText>
            </AppText>
          </View>

          <View style={styles.codeContainer}>
          {isIOS ? (
            <Pressable
              style={styles.iosCodePressable}
              onPress={() => iosHiddenInputRef.current?.focus()}>
              {code.map((digit, index) => (
                <View
                  key={index}
                  style={[
                    styles.codeInput,
                    digit !== '' && styles.codeInputFilled,
                    authStore.error && styles.codeInputError,
                    styles.iosCodeBox,
                  ]}>
                  <AppText weight="semiBold" style={styles.iosCodeDigit}>{digit}</AppText>
                </View>
              ))}

              <AppTextInput
                ref={iosHiddenInputRef}
                style={styles.hiddenCodeInput}
                value={code.join('')}
                onChangeText={handleIOSCodeChange}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                maxLength={4}
                autoFocus
                editable={!authStore.isLoading}
              />
            </Pressable>
          ) : (
            code.map((digit, index) => (
              <AppTextInput
                key={index}
                weight="semiBold"
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.codeInput,
                  digit !== '' && styles.codeInputFilled,
                  authStore.error && styles.codeInputError,
                ]}
                value={digit}
                onChangeText={(value) => handleCodeChange(value, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="number-pad"
                maxLength={1}
                autoFocus={index === 0}
                editable={!authStore.isLoading}
                selectTextOnFocus
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
              />
            ))
          )}
        </View>

        {authStore.error && <AppText style={styles.errorText}>{authStore.error}</AppText>}

          <View style={styles.resendContainer}>
            {canResend ? (
              <Pressable onPress={handleResendCode} disabled={authStore.isLoading}>
                <AppText style={styles.resendText}>Отправить повторно</AppText>
              </Pressable>
            ) : (
              <AppText style={styles.timerText}>
                Отправить повторно через {timer} секунд
              </AppText>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray[50],
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authContainer: {
    paddingTop: 24,
    gap: 24,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    lineHeight: 28.8,
    color: theme.colors.gray[900],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 16.8,
    color: '#73716F',
    textAlign: 'center',
  },
  phone: {
    color: theme.colors.gray[900],
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  iosCodePressable: {
    flexDirection: 'row',
    gap: 8,
  },
  codeInput: {
    width: 59,
    height: 52,
    backgroundColor: theme.colors.gray[100],
    borderWidth: 1,
    borderColor: '#F4F3F0',
    borderRadius: 16,
    fontSize: 24,
    color: theme.colors.gray[900],
    textAlign: 'center',
  },
  iosCodeBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iosCodeDigit: {
    fontSize: 24,
    color: theme.colors.gray[900],
  },
  hiddenCodeInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  codeInputFilled: {
    borderColor: theme.colors.gray[900],
  },
  codeInputError: {
    borderColor: theme.colors.accent.primary,
    backgroundColor: '#FFF5F6',
  },
  errorText: {
    fontSize: 14,
    lineHeight: 19.6,
    color: theme.colors.accent.primary,
    textAlign: 'center',
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    lineHeight: 16.8,
    color: theme.colors.gray[900],
  },
  timerText: {
    fontSize: 14,
    lineHeight: 16.8,
    color: '#73716F',
  },
});
