/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { sentry } from './services/sentry';

sentry.initialize();

AppRegistry.registerComponent(appName, () => sentry.wrap(App));
