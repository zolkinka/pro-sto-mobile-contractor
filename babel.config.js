const envFile =
  process.env.ENVFILE ||
  (process.argv.includes('--dev') &&
  process.argv[process.argv.indexOf('--dev') + 1] === 'false'
    ? '.env.production'
    : '.env');

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
        path: envFile,
        allowUndefined: true,
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
