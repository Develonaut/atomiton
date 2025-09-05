import baseConfig from "@atomiton/eslint-config/base";

export default [
  ...baseConfig,
  {
    rules: {
      // Allow console in event system for error handling  
      "no-console": ["error", { allow: ["error", "warn"] }],
    },
  },
];