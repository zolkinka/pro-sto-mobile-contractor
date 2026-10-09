import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { theme } from '@/constants/theme';
import type { MainStackParamList } from '@/navigation/types';

type Navigation = NativeStackNavigationProp<MainStackParamList>;

export function BookingConfirmLockoutHint() {
  const navigation = useNavigation<Navigation>();

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.supportRow}
        onPress={() => navigation.navigate('ContactSupport')}
        accessibilityRole="button"
        accessibilityLabel="Написать в поддержку">
        <Icon name="headphones" size={20} color={theme.colors.gray[900]} />
        <AppText weight="medium" style={styles.supportLabel}>
          Написать в поддержку
        </AppText>
        <Icon name="chevron-right" size={20} color={theme.colors.gray[600]} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: theme.colors.gray[100],
  },
  supportLabel: {
    fontSize: 15,
    lineHeight: 18,
    color: theme.colors.gray[900],
  },
});
