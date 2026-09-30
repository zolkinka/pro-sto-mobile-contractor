import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { getHeaderBackOptions } from '@/components/ui/header-back';
import { BookingCodeScreen } from '@/screens/bookings/BookingCodeScreen';
import { BookingConfirmedScreen } from '@/screens/bookings/BookingConfirmedScreen';
import { BookingsListScreen } from '@/screens/bookings/BookingsListScreen';
import { OrderDetailsScreen } from '@/screens/bookings/OrderDetailsScreen';
import { QrScanScreen } from '@/screens/bookings/QrScanScreen';
import { ContactSupportScreen } from '@/screens/profile/ContactSupportScreen';
import { NotificationSettingsScreen } from '@/screens/profile/NotificationSettingsScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { SupportScreen } from '@/screens/profile/SupportScreen';

import type { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

function DevUiShowcaseScreen(props: object) {
  const { UiShowcaseScreen } = require('@/screens/UiShowcaseScreen') as typeof import('@/screens/UiShowcaseScreen');
  return <UiShowcaseScreen {...props} />;
}

export function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={BookingsListScreen} options={{ animation: 'none' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ animation: 'none' }} />
      <Stack.Screen
        name="Support"
        component={SupportScreen}
        options={({ navigation }) =>
          getHeaderBackOptions({ title: 'Поддержка' }, () => navigation.goBack())
        }
      />
      <Stack.Screen
        name="ContactSupport"
        component={ContactSupportScreen}
        options={({ navigation }) =>
          getHeaderBackOptions({ title: 'Написать в поддержку' }, () => navigation.goBack())
        }
      />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={({ navigation }) =>
          getHeaderBackOptions({ title: 'Настройки уведомлений' }, () => navigation.goBack())
        }
      />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <Stack.Screen
        name="QrScan"
        component={QrScanScreen}
        options={({ route }) => ({
          animation: route.params?.fromMenu ? 'none' : 'default',
        })}
      />
      <Stack.Screen name="BookingCode" component={BookingCodeScreen} />
      <Stack.Screen
        name="BookingConfirmed"
        component={BookingConfirmedScreen}
        options={{
          presentation: 'transparentModal',
          animation: 'none',
          gestureEnabled: false,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
      {__DEV__ && (
        <Stack.Screen name="UiShowcase" component={DevUiShowcaseScreen} />
      )}
    </Stack.Navigator>
  );
}
