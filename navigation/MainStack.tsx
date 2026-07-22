import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeScreenStub } from '@/screens/home/HomeScreenStub';

import type { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

export function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreenStub} />
    </Stack.Navigator>
  );
}
