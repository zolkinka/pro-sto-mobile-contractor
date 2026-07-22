import { observer } from 'mobx-react-lite';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProStoLogo } from '@/components/auth/prosto-logo';
import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { theme } from '@/constants/theme';
import { authStore } from '@/stores/auth.store';

const MOCK_BOOKINGS = [
  {
    id: '1',
    title: 'Toyota Land Cruiser Prado',
    time: '13:30 – 14:30',
    plate: 'C789K077',
    box: 'Бокс 4',
    backgroundColor: '#E8E4FF',
  },
  {
    id: '2',
    title: 'Mercedes GLE',
    time: '13:30 – 14:30',
    plate: 'C789K077',
    box: 'Бокс 5',
    backgroundColor: '#DDF4E8',
  },
  {
    id: '3',
    title: 'Toyota Land Cruiser Prado',
    time: '13:30 – 14:30',
    plate: 'C789K077',
    box: 'Бокс 4',
    backgroundColor: theme.colors.gray[100],
  },
  {
    id: '4',
    title: 'Toyota Land Cruiser Prado',
    time: '13:30 – 14:30',
    plate: 'C789K077',
    box: 'Бокс 4',
    backgroundColor: theme.colors.gray[100],
  },
];

export const HomeScreenStub = observer(function HomeScreenStub() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.datePill}>
          <AppText weight="semiBold" style={styles.dateText}>29 июня</AppText>
        </View>
        <ProStoLogo />
      </View>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {MOCK_BOOKINGS.map((booking) => (
          <View
            key={booking.id}
            style={[styles.card, { backgroundColor: booking.backgroundColor }]}>
            <View style={styles.cardHeader}>
              <AppText weight="semiBold" style={styles.cardTitle}>{booking.title}</AppText>
              <View style={styles.cardIcon}>
                <Icon name="orders" size={18} color={theme.colors.gray[900]} />
              </View>
            </View>
            <AppText style={styles.cardMeta}>
              {booking.time} · {booking.plate} · {booking.box}
            </AppText>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable style={styles.bottomButton}>
          <Icon name="user" size={22} color={theme.colors.gray[50]} />
        </Pressable>
        <Pressable style={styles.bottomButton}>
          <Icon name="notification" size={22} color={theme.colors.gray[50]} />
        </Pressable>
        <Pressable style={styles.bottomButton} onPress={() => authStore.logout()}>
          <Icon name="orders" size={22} color={theme.colors.gray[50]} />
        </Pressable>
      </View>
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
  dateText: {
    color: theme.colors.gray[50],
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 120,
  },
  card: {
    borderRadius: 24,
    padding: 16,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    color: theme.colors.gray[900],
  },
  cardIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMeta: {
    fontSize: 14,
    color: theme.colors.gray[700],
  },
  bottomBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 24,
    backgroundColor: theme.colors.gray[900],
    borderRadius: 999,
    paddingHorizontal: 28,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
