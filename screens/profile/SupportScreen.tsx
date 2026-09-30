import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { ErrorStateView } from '@/components/ui/error-state-view';
import { Icon } from '@/components/ui/icon';
import { theme } from '@/constants/theme';
import type { MainStackParamList } from '@/navigation/types';
import { getApiErrorMessage } from '@/services/api-client';
import { fetchFaq, type FaqItem } from '@/services/faq-api';

type Navigation = NativeStackNavigationProp<MainStackParamList, 'Support'>;

export function SupportScreen() {
  const navigation = useNavigation<Navigation>();
  const [items, setItems] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadFaq = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const faq = await fetchFaq();
      setItems(faq);
      setExpandedId(faq[0]?.uuid ?? null);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFaq().catch(() => undefined);
  }, [loadFaq]);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <AppText weight="semiBold" style={styles.sectionTitle}>
        Частые вопросы
      </AppText>

      <View style={styles.card}>
        {isLoading ? (
          <View style={styles.state}>
            <ActivityIndicator color={theme.colors.gray[900]} />
          </View>
        ) : null}

        {!isLoading && error ? (
          <ErrorStateView message={error} onRetry={loadFaq} style={styles.errorState} />
        ) : null}

        {!isLoading && !error && items.length === 0 ? (
          <View style={styles.state}>
            <AppText style={styles.emptyText}>Пока нет частых вопросов</AppText>
          </View>
        ) : null}

        {!isLoading && !error
          ? items.map((item, index) => (
              <View key={item.uuid}>
                <Pressable
                  style={styles.questionRow}
                  onPress={() => setExpandedId((current) => (current === item.uuid ? null : item.uuid))}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: expandedId === item.uuid }}>
                  <AppText style={styles.question}>{item.question}</AppText>
                  <View style={{ transform: [{ rotate: expandedId === item.uuid ? '-90deg' : '90deg' }] }}>
                    <Icon name="chevron-right" size={24} color={theme.colors.gray[600]} />
                  </View>
                </Pressable>
                {expandedId === item.uuid ? (
                  <AppText style={styles.answer}>{item.answer}</AppText>
                ) : null}
                {index < items.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            ))
          : null}
      </View>

      <Pressable
        style={styles.actionCard}
        onPress={() => navigation.navigate('ContactSupport')}
        accessibilityRole="button"
        accessibilityLabel="Написать в поддержку">
        <View style={styles.actionLeft}>
          <Icon name="headphones" size={24} color={theme.colors.gray[900]} />
          <AppText style={styles.actionLabel}>Написать в поддержку</AppText>
        </View>
        <Icon name="chevron-right" size={24} color={theme.colors.gray[600]} />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: theme.colors.gray[50],
  },
  content: {
    padding: 16,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 22,
    color: theme.colors.gray[900],
  },
  card: {
    backgroundColor: theme.colors.gray[100],
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  state: {
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.gray[600],
  },
  errorState: {
    flex: 0,
    minHeight: 160,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 16,
  },
  question: {
    flex: 1,
    fontSize: 16,
    lineHeight: 19.2,
    color: theme.colors.gray[800],
  },
  answer: {
    fontSize: 14,
    lineHeight: 18,
    color: theme.colors.gray[600],
    paddingBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.gray[200],
  },
  actionCard: {
    backgroundColor: theme.colors.gray[100],
    borderRadius: 16,
    padding: 16,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  actionLabel: {
    fontSize: 16,
    lineHeight: 19.2,
    color: theme.colors.gray[800],
  },
});
