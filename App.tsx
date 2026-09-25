import React, { useEffect } from 'react';
import { LogBox, StatusBar, useColorScheme } from 'react-native';

import { API_BASE_URL } from '@/constants/config';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from '@/navigation/RootNavigator';

LogBox.ignoreLogs(['Open debugger to view warnings.']);

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    if (__DEV__) {
      console.log(`[API] Using API_BASE_URL=${API_BASE_URL}`);
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
