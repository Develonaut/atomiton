import baseConfig from "@atomiton/eslint-config/base";

export default [
  ...baseConfig,
  {
    ignores: ["dist", "node_modules", "*.config.js", "*.config.ts"],
  },
];
