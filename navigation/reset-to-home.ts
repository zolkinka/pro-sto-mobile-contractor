import { StackActions, type NavigationProp } from '@react-navigation/native';

import type { MainStackParamList } from './types';

/** Pops stack screens above the existing Home route (keeps list mounted, no ghost back). */
export function resetToHome(navigation: NavigationProp<MainStackParamList>): void {
  navigation.dispatch(StackActions.popTo('Home'));
}
