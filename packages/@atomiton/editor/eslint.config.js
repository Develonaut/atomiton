import config from "@atomiton/eslint-config/react-internal";

export default [
  ...config,
  {
    rules: {
      "react/prop-types": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
];
