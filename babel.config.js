module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // keep only the required babel plugin for expo-router
    plugins: ['expo-router/babel'],
  };
};