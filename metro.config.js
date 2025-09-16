// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add additional file extensions for Metro to process
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs'];
config.resolver.assetExts = ['glb', 'gltf', 'png', 'jpg', 'ttf'];

// Ensure Metro finds the correct entry point
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.watchFolders = [path.resolve(__dirname)];

module.exports = config;