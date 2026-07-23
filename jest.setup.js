/* eslint-env jest */

jest.mock('@/screens/UiShowcaseScreen', () => ({
  UiShowcaseScreen: () => null,
}));

jest.mock('mobx-react-lite', () => ({
  observer: (component) => component,
}));

jest.mock('@/stores/auth.store', () => ({
  authStore: {
    isInitialized: true,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    phone: null,
    initializeAuth: jest.fn(),
    sendCode: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    clearError: jest.fn(),
  },
}));

jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(async () => true),
  getGenericPassword: jest.fn(async () => false),
  resetGenericPassword: jest.fn(async () => true),
}));

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    NavigationContainer: ({ children }) => children,
  };
});

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: () => null,
  }),
}));

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');

  return {
    GestureHandlerRootView: View,
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    PanGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    NativeViewGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: require('react-native').FlatList,
    ScrollView: require('react-native').ScrollView,
    Switch: require('react-native').Switch,
    TextInput: require('react-native').TextInput,
    TouchableOpacity: require('react-native').TouchableOpacity,
    TouchableHighlight: require('react-native').TouchableHighlight,
    TouchableWithoutFeedback: require('react-native').TouchableWithoutFeedback,
  };
});
