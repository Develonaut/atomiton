import baseConfig from "@atomiton/eslint-config/base";

export default [
  ...baseConfig,
  {
    rules: {
      // Allow console methods in logging package
      "no-console": "off",
    },
  },
];