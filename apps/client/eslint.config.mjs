import config from "@atomiton/eslint-config/react-internal";

export default [
  ...config,
  {
    rules: {
      // Temporary rules for incomplete components
      "no-console": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];