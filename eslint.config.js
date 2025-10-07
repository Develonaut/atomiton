import baseConfig from "@atomiton/eslint-config/base";

export default [
  ...baseConfig,
  {
    files: ["packages/@atomiton/test/**/*.ts"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
];
