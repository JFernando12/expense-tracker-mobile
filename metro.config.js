const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
 
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

// Enable Hermes optimizations for better memory management
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

// Add resolver for better memory management
config.resolver = {
  ...config.resolver,
  unstable_enableSymlinks: false,
};
 
module.exports = withNativeWind(config, { input: './app/global.css' })