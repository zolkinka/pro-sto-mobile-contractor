import React, { type ReactNode } from 'react';
import { Alert } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { authStore } from '@/stores/auth.store';

const mockNavigate = jest.fn();

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');

  return {
    SafeAreaProvider: ({ children }: { children: ReactNode }) => children,
    SafeAreaView: View,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('@/services/service-center-api', () => ({
  fetchServiceCenterName: jest.fn(async () => 'Шинка'),
}));

jest.mock('@/stores/auth.store', () => ({
  authStore: {
    user: {
      phone: '+79991234567',
      email: 'admin@example.com',
      name: 'Admin',
      serviceCenterUuid: 'sc-1',
    },
    phone: '+79991234567',
    logout: jest.fn(async () => undefined),
  },
}));

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the signed-in phone number', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<ProfileScreen />);
    });

    expect(JSON.stringify(tree!.toJSON())).toContain('+7 (999) 123-45-67');
    expect(JSON.stringify(tree!.toJSON())).toContain('Шинка');
  });

  it('logs out after confirmation', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<ProfileScreen />);
    });

    const logoutButton = tree!.root.findByProps({ accessibilityLabel: 'Выйти' });

    await ReactTestRenderer.act(async () => {
      logoutButton.props.onPress();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'Выход из аккаунта',
      'Вы уверены, что хотите выйти?',
      expect.any(Array),
    );

    const buttons = alertSpy.mock.calls[0]?.[2] as Array<{
      text: string;
      onPress?: () => void;
    }>;
    const confirm = buttons.find((button) => button.text === 'Выйти');

    await ReactTestRenderer.act(async () => {
      confirm?.onPress?.();
    });

    expect(authStore.logout).toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});
