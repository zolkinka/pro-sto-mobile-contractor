import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { theme } from '@/constants/theme';
import { authStore } from '@/stores/auth.store';

import { AuthStack } from './AuthStack';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function MainStackScreen() {
  const { MainStack } = require('./MainStack') as typeof import('./MainStack');
  return <MainStack />;
}

export const RootNavigator = observer(function RootNavigator() {
  if (!authStore.isInitialized) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={theme.colors.gray[900]} />
      </View>
    );
  }

  return (
    <NavigationContainer key={authStore.isAuthenticated ? 'main' : 'auth'}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {authStore.isAuthenticated ? (
          <Stack.Screen name="Main" component={MainStackScreen} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
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
