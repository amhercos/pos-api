const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// We use process.cwd() instead of __dirname to stay
// compatible with the Windows file system logic
const config = getDefaultConfig(process.cwd());

module.exports = withNativeWind(config, { input: "./global.css" });
