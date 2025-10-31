// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Keep all default source extensions and add TS/JS variants explicitly if needed
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs'];

// Ensure proper module resolution for node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

// IMPORTANT: extend assetExts, do not override defaults
config.resolver.assetExts = [...config.resolver.assetExts, 'glb', 'gltf', 'png', 'jpg', 'ttf'];

// Prefer React Native/browser builds over Node
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Alias Node-only 'ws' to a shim that uses global WebSocket in RN
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  ws: path.resolve(__dirname, 'shims/ws.js'),
};

config.watchFolders = [path.resolve(__dirname)];

module.exports = config;