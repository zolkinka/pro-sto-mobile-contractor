import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { BookingCodeScreen } from '@/screens/bookings/BookingCodeScreen';
import { BookingConfirmedScreen } from '@/screens/bookings/BookingConfirmedScreen';
import { BookingPhoneScreen } from '@/screens/bookings/BookingPhoneScreen';
import { BookingsListScreen } from '@/screens/bookings/BookingsListScreen';
import { OrderDetailsScreen } from '@/screens/bookings/OrderDetailsScreen';
import { QrScanScreen } from '@/screens/bookings/QrScanScreen';

import type { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

function DevUiShowcaseScreen(props: object) {
  const { UiShowcaseScreen } = require('@/screens/UiShowcaseScreen') as typeof import('@/screens/UiShowcaseScreen');
  return <UiShowcaseScreen {...props} />;
}

export function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={BookingsListScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <Stack.Screen name="QrScan" component={QrScanScreen} />
      <Stack.Screen name="BookingCode" component={BookingCodeScreen} />
      <Stack.Screen name="BookingPhone" component={BookingPhoneScreen} />
      <Stack.Screen name="BookingConfirmed" component={BookingConfirmedScreen} />
      {__DEV__ && (
        <Stack.Screen name="UiShowcase" component={DevUiShowcaseScreen} />
      )}
    </Stack.Navigator>
  );
}
