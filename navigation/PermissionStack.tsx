import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CameraPermissionScreen } from '@/screens/permissions/CameraPermissionScreen';
import { NotificationPermissionScreen } from '@/screens/permissions/NotificationPermissionScreen';

import type { PermissionStackParamList } from './types';

const Stack = createNativeStackNavigator<PermissionStackParamList>();

export function PermissionStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Camera" component={CameraPermissionScreen} />
      <Stack.Screen name="Notifications" component={NotificationPermissionScreen} />
    </Stack.Navigator>
  );
}
