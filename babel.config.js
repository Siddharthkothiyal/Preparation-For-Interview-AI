module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Removed: plugins: ['expo-router/babel'] (deprecated in SDK 50)
  };
};