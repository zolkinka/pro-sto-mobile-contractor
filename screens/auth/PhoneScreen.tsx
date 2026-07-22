import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProStoLogo } from '@/components/auth/prosto-logo';
import { AppButton } from '@/components/ui/app-button';
import { Icon } from '@/components/ui/icon';
import { AppInput } from '@/components/ui/app-input';
import { AppText } from '@/components/ui/app-text';
import { PRIVACY_POLICY_URL } from '@/constants/config';
import { theme } from '@/constants/theme';
import type { AuthStackParamList } from '@/navigation/types';
import { authStore } from '@/stores/auth.store';
import { formatPhone, isValidPhone } from '@/utils/phone-mask';

type PhoneScreenNavigation = NativeStackNavigationProp<AuthStackParamList, 'Phone'>;

export const PhoneScreen = observer(function PhoneScreen() {
  const navigation = useNavigation<PhoneScreenNavigation>();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handlePhoneChange = (text: string) => {
    authStore.clearError();
    setPhone(formatPhone(text));
  };

  const handleSendCode = async () => {
    if (!isValidPhone(phone)) {
      Alert.alert('Ошибка', 'Введите корректный номер телефона');
      return;
    }

    if (!agreedToTerms) {
      Alert.alert('Ошибка', 'Необходимо согласие на обработку персональных данных');
      return;
    }

    const success = await authStore.sendCode(phone);

    if (success) {
      navigation.navigate('Code');
    }
  };

  const isButtonDisabled = !isValidPhone(phone) || !agreedToTerms || authStore.isLoading;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.mainContainer}>
          <View style={styles.logoContainer}>
            <ProStoLogo width={150} />
          </View>

          <View style={styles.signInBlock}>
            <View style={styles.header}>
              <AppText weight="medium" style={styles.title}>
                Добро пожаловать!
              </AppText>
              <AppText style={styles.subtitle}>
                Введите номер телефона для входа в смену.
              </AppText>
            </View>

            <AppInput
              value={phone}
              onChangeText={handlePhoneChange}
              placeholder="+7"
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              maxLength={18}
              editable={!authStore.isLoading}
            />

            {authStore.error && <AppText style={styles.errorText}>{authStore.error}</AppText>}

            <View style={styles.consentBlock}>
              <Pressable
                onPress={() => setAgreedToTerms((value) => !value)}
                hitSlop={8}
                style={styles.checkboxPressable}>
                <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                  {agreedToTerms && (
                    <Icon name="check" size={11} color={theme.colors.gray[50]} />
                  )}
                </View>
              </Pressable>
              <Pressable
                style={styles.consentTextContainer}
                onPress={() => setAgreedToTerms((value) => !value)}>
                <AppText style={styles.consentText}>
                  Продолжая, вы соглашаетесь с условиями{' '}
                  <AppText
                    style={styles.consentLink}
                    onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}>
                    оферты
                  </AppText>
                  {'\n'}
                  <AppText
                    style={styles.consentLink}
                    onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}>
                    и обработки персональных данных
                  </AppText>
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <AppButton
          label={authStore.isLoading ? 'Отправка...' : 'Поехали'}
          onPress={handleSendCode}
          disabled={isButtonDisabled}
        />
      </View>
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
  mainContainer: {
    paddingTop: 52,
    gap: 40,
  },
  logoContainer: {
    alignItems: 'center',
  },
  signInBlock: {
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
    fontSize: 16,
    lineHeight: 19.2,
    color: theme.colors.gray[900],
    textAlign: 'center',
    maxWidth: 358,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 19.6,
    color: theme.colors.accent.primary,
    textAlign: 'center',
  },
  consentBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignSelf: 'center',
    gap: 12,
    width: '100%',
    maxWidth: 330,
  },
  checkboxPressable: {
    marginTop: 1,
  },
  consentTextContainer: {
    flex: 1,
  },
  consentText: {
    fontSize: 12,
    lineHeight: 14.4,
    color: theme.colors.gray[900],
    textAlign: 'center',
  },
  consentLink: {
    fontSize: 12,
    lineHeight: 14.4,
    color: theme.colors.gray[900],
    textDecorationLine: 'underline',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.gray[900],
    borderColor: theme.colors.gray[900],
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: theme.colors.gray[50],
  },
});
