const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configurations for better platform handling
config.resolver.platforms = ['native', 'web', 'ios', 'android'];

// Exclude react-native-maps from web bundles
config.resolver.blockList = [
  // Block react-native-maps on web platform
  /react-native-maps\/.*$/,
];

module.exports = config;