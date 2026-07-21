import { theme } from '@/constants/theme';
import React from 'react';
import { Platform, Pressable } from 'react-native';
import { Icon } from './icon';

interface HeaderBackProps {
  title: string;
  onBackPress?: () => void;
}

/**
 * Функция для создания конфигурации заголовка с кнопкой "назад"
 * Используется в Stack.Screen для стандартизации заголовков
 */
export const getHeaderBackOptions = (
  props: HeaderBackProps,
  onBackPressed: () => void,
) => ({
  headerShown: true,
  headerTitle: props.title,
  headerBackTitle: '',
  headerBackVisible: false,
  // Настройка стилей заголовка
  headerStyle: {
    backgroundColor: '#FFFFFF',
  },
  headerTintColor: theme.colors.gray[900],
  headerTitleStyle: {
    fontWeight: '600' as const,
    fontSize: 17,
    color: theme.colors.gray[900],
  },
  headerLeftContainerStyle: {
    paddingLeft: Platform.OS === 'android' ? 16 : 8,
  },
  headerLeft: () => (
    <Pressable
      onPress={props.onBackPress || onBackPressed}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      style={({ pressed }) => ({
        opacity: pressed ? 0.5 : 1,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        width: 32,
        height: 32,
        marginRight: Platform.OS === 'android' ? 8 : 0,
      })}
    >
      <Icon name="arrow-left" size={24} color={theme.colors.gray[900]} />
    </Pressable>
  ),
});
