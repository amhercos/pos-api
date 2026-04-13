const expoConfig = require("eslint-config-expo/flat");

module.exports = [
  ...expoConfig,
  {
    //Global rules for ts
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "react/no-unescaped-entities": "off",
    },
  },
  {
    files: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
    languageOptions: {
      globals: {
        it: "readonly",
        expect: "readonly",
        describe: "readonly",
        beforeEach: "readonly",
        test: "readonly",
      },
    },
  },
  {
    ignores: ["dist/*", ".expo/*", "node_modules/*"],
  },
];
