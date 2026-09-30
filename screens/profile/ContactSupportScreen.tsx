import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { theme } from '@/constants/theme';
import type { MainStackParamList } from '@/navigation/types';
import { getApiErrorMessage } from '@/services/api-client';
import { submitFeedback } from '@/services/feedback-api';
import { authStore } from '@/stores/auth.store';

type Navigation = NativeStackNavigationProp<MainStackParamList, 'ContactSupport'>;

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export const ContactSupportScreen = observer(function ContactSupportScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState(authStore.user?.email ?? '');
  const [message, setMessage] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const nextEmailError = isEmail(email) ? null : 'Укажите email';
    const nextMessageError = message.trim() ? null : 'Напишите сообщение';
    setEmailError(nextEmailError);
    setMessageError(nextMessageError);

    if (nextEmailError || nextMessageError) {
      return;
    }

    setIsSubmitting(true);

    try {
      await submitFeedback({
        email,
        message,
        name: authStore.user?.name,
      });
      Alert.alert('Обращение отправлено', 'Мы ответим на указанный email', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Не удалось отправить', getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <AppInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          error={emailError ?? undefined}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="name@example.com"
        />
        <AppInput
          label="Сообщение"
          value={message}
          onChangeText={setMessage}
          error={messageError ?? undefined}
          multiline
          textAlignVertical="top"
          placeholder="Опишите вопрос"
          inputContainerStyle={styles.messageInput}
        />
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <AppButton label="Отправить" onPress={handleSubmit} disabled={isSubmitting} />
      </View>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.gray[50],
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  messageInput: {
    height: 140,
    alignItems: 'flex-start',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});
