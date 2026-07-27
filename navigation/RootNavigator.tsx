import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { theme } from '@/constants/theme';
import { authStore } from '@/stores/auth.store';
import { permissionsStore } from '@/stores/permissions.store';

import { AuthStack } from './AuthStack';
import { PermissionStack } from './PermissionStack';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function MainStackScreen() {
  const { MainStack } = require('./MainStack') as typeof import('./MainStack');
  return <MainStack />;
}

export const RootNavigator = observer(function RootNavigator() {
  const isBootstrapping = !authStore.isInitialized || !permissionsStore.isInitialized;

  if (isBootstrapping) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={theme.colors.gray[900]} />
      </View>
    );
  }

  const rootFlow = !authStore.isAuthenticated
    ? 'auth'
    : permissionsStore.hasCompletedOnboarding
      ? 'main'
      : 'permissions';

  return (
    <NavigationContainer>
      <Stack.Navigator key={rootFlow} screenOptions={{ headerShown: false }}>
        {rootFlow === 'auth' && <Stack.Screen name="Auth" component={AuthStack} />}
        {rootFlow === 'permissions' && (
          <Stack.Screen name="Permissions" component={PermissionStack} />
        )}
        {rootFlow === 'main' && <Stack.Screen name="Main" component={MainStackScreen} />}
      </Stack.Navigator>
    </NavigationContainer>
  );
});

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.gray[50],
  },
});
