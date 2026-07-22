module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['.'],
        alias: {
          '@': './',
        },
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
      },
    ],
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: process.env.ENVFILE || '.env',
        allowUndefined: true,
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
