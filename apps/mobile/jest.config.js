/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  setupFiles: ["@shopify/flash-list/jestSetup"],
  // lucide-react-native's React Native build is .mjs, which Jest only loads as
  // native ESM; use its CommonJS build instead.
  moduleNameMapper: {
    "^lucide-react-native$": require.resolve("lucide-react-native"),
  },
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|uniwind|@shopify/flash-list|standard-navigation))",
  ],
};
