const reactNativePreset = require('react-native/jest-preset');

module.exports = {
  ...reactNativePreset,
  setupFilesAfterEnv: [...(reactNativePreset.setupFilesAfterEnv ?? []), '<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    ...reactNativePreset.moduleNameMapper,
    '^@env$': '<rootDir>/__mocks__/env.js',
    '^@/(.*)$': '<rootDir>/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(\\.pnpm/.+/node_modules/)?((jest-)?react-native|@react-native|react-native-.*|@react-navigation|@expo))',
  ],
};
