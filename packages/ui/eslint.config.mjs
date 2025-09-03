import { config } from "@repo/eslint-config/react-internal";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    ignores: [
      "preview-dist/**",
      "**/fixtures/.cache/**",
      "**/.turbo/**",
    ]
  }
];
