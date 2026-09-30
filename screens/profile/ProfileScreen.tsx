import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { MainBottomBar, type MainBottomTab } from '@/components/bookings/main-bottom-bar';
import {
  getBottomOverlayScrollPadding,
  StickyBottomOverlay,
} from '@/components/bookings/sticky-bottom-overlay';
import { AppText } from '@/components/ui/app-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { theme } from '@/constants/theme';
import type { MainStackParamList } from '@/navigation/types';
import { fetchServiceCenterName } from '@/services/service-center-api';
import { authStore } from '@/stores/auth.store';
import { formatPhone } from '@/utils/phone-mask';
import { readServiceCenterUuid } from '@/utils/service-center-uuid';

type Navigation = NativeStackNavigationProp<MainStackParamList, 'Profile'>;

export const ProfileScreen = observer(function ProfileScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = getBottomOverlayScrollPadding(insets.bottom, 56, 'floating');
  const phone = authStore.user?.phone || authStore.phone || '';
  const formattedPhone = phone ? formatPhone(phone) : '';
  const serviceCenterUuid =
    authStore.user?.serviceCenterUuid || readServiceCenterUuid(authStore.accessToken);
  const [serviceName, setServiceName] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceCenterUuid) {
      setServiceName(null);
      return;
    }

    let cancelled = false;

    fetchServiceCenterName(serviceCenterUuid)
      .then((name) => {
        if (!cancelled) {
          setServiceName(name);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setServiceName(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [serviceCenterUuid]);

  const handleLogout = () => {
    Alert.alert('Выход из аккаунта', 'Вы уверены, что хотите выйти?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Выйти',
        style: 'destructive',
        onPress: () => {
          authStore.logout().catch(() => undefined);
        },
      },
    ]);
  };

  const handleBottomTabPress = (tab: MainBottomTab) => {
    if (tab === 'profile') {
      return;
    }

    if (tab === 'bookings') {
      navigation.navigate('Home');
      return;
    }

    navigation.navigate('QrScan', { fromMenu: true });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: scrollBottomPadding }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.phoneHeader}>
          <View style={styles.phoneIcon}>
            <Icon name="user" size={20} color={theme.colors.gray[800]} />
          </View>
          <View style={styles.phoneTextBlock}>
            <AppText style={styles.phoneText}>{formattedPhone}</AppText>
            {serviceName ? <AppText style={styles.serviceName}>{serviceName}</AppText> : null}
          </View>
        </View>

        <View style={styles.menuSection}>
          <View style={styles.menuCard}>
            <MenuItem
              icon="support"
              label="Поддержка"
              onPress={() => navigation.navigate('Support')}
            />
          </View>

          <View style={styles.menuCard}>
            <MenuItem
              icon="notification"
              label="Настройки уведомлений"
              onPress={() => navigation.navigate('NotificationSettings')}
            />
            <MenuDivider />
            <MenuItem icon="logout" label="Выйти" onPress={handleLogout} showChevron={false} />
          </View>
        </View>
      </ScrollView>

      <StickyBottomOverlay variant="floating" bottomPadding={16}>
        <MainBottomBar activeTab="profile" onTabPress={handleBottomTabPress} />
      </StickyBottomOverlay>
    </SafeAreaView>
  );
});

interface MenuItemProps {
  icon: IconName;
  label: string;
  onPress: () => void;
  showChevron?: boolean;
}

function MenuItem({ icon, label, onPress, showChevron = true }: MenuItemProps) {
  return (
    <Pressable
      style={styles.menuItem}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <View style={styles.menuItemLeft}>
        <Icon name={icon} size={24} color={theme.colors.gray[800]} />
        <AppText style={styles.menuItemLabel}>{label}</AppText>
      </View>
      {showChevron ? <Icon name="chevron-right" size={24} color={theme.colors.gray[600]} /> : null}
    </Pressable>
  );
}

function MenuDivider() {
  return (
    <View style={styles.menuDividerContainer}>
      <View style={styles.menuDivider} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.gray[50],
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 20,
  },
  phoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  phoneIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneTextBlock: {
    flex: 1,
    gap: 2,
  },
  phoneText: {
    fontSize: 14,
    lineHeight: 16.8,
    color: theme.colors.gray[700],
  },
  serviceName: {
    fontSize: 14,
    lineHeight: 16.8,
    color: theme.colors.gray[800],
  },
  menuSection: {
    gap: 16,
  },
  menuCard: {
    backgroundColor: theme.colors.gray[100],
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    minHeight: 56,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  menuItemLabel: {
    fontSize: 16,
    lineHeight: 19.2,
    color: theme.colors.gray[800],
  },
  menuDividerContainer: {
    paddingVertical: 6,
  },
  menuDivider: {
    height: 1,
    backgroundColor: theme.colors.gray[200],
  },
});
