import React from 'react';
import { Pressable } from 'react-native';
import { Icon } from './icon';
import { theme } from '@/constants/theme';

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
  headerLeft: () => (
    <Pressable onPress={props.onBackPress || onBackPressed}>
      <Icon name="arrow-left" size={24} color={theme.colors.gray[900]} />
    </Pressable>
  ),
});
