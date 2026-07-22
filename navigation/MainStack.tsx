import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeScreenStub } from '@/screens/home/HomeScreenStub';

import type { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

function DevUiShowcaseScreen(props: object) {
  const { UiShowcaseScreen } = require('@/screens/UiShowcaseScreen') as typeof import('@/screens/UiShowcaseScreen');
  return <UiShowcaseScreen {...props} />;
}

export function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreenStub} />
      {__DEV__ && (
        <Stack.Screen name="UiShowcase" component={DevUiShowcaseScreen} />
      )}
    </Stack.Navigator>
  );
}
