import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/app-button';
import { AppText } from '@/components/ui/app-text';
import { ErrorStateView } from '@/components/ui/error-state-view';
import { Switch } from '@/components/ui/switch';
import { theme } from '@/constants/theme';
import type { MainStackParamList } from '@/navigation/types';
import { getApiErrorMessage } from '@/services/api-client';
import {
  fetchNotificationSettings,
  updateNotificationSettings,
  type AdminNotificationSettings,
} from '@/services/notification-settings-api';

type Navigation = NativeStackNavigationProp<MainStackParamList, 'NotificationSettings'>;

const SETTING_ROWS: Array<{ key: keyof AdminNotificationSettings; label: string }> = [
  { key: 'newBooking', label: 'Новые записи' },
  { key: 'statusChange', label: 'Смена статуса' },
  { key: 'reminders', label: 'Напоминания' },
];

export function NotificationSettingsScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState<AdminNotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextSettings = await fetchNotificationSettings();
      setSettings(nextSettings);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings().catch(() => undefined);
  }, [loadSettings]);

  const handleToggle = (key: keyof AdminNotificationSettings, value: boolean) => {
    setSettings((current) => (current ? { ...current, [key]: value } : current));
  };

  const handleSave = async () => {
    if (!settings) {
      return;
    }

    setIsSaving(true);

    try {
      const saved = await updateNotificationSettings(settings);
      setSettings(saved);
      Alert.alert('Успешно', 'Настройки уведомлений сохранены', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (saveError) {
      Alert.alert('Ошибка', getApiErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.colors.gray[900]} />
      </View>
    );
  }

  if (error || !settings) {
    return (
      <View style={styles.screen}>
        <ErrorStateView message={error ?? 'Не удалось загрузить настройки'} onRetry={loadSettings} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {SETTING_ROWS.map((row, index) => (
            <View key={row.key}>
              <View style={styles.row}>
                <AppText style={styles.label}>{row.label}</AppText>
                <Switch
                  value={settings[row.key]}
                  onValueChange={(value) => handleToggle(row.key, value)}
                />
              </View>
              {index < SETTING_ROWS.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <AppButton label="Сохранить" onPress={handleSave} disabled={isSaving} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.gray[50],
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.gray[50],
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: theme.colors.gray[100],
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
  },
  label: {
    flex: 1,
    fontSize: 16,
    lineHeight: 19.2,
    color: theme.colors.gray[800],
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.gray[200],
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});
