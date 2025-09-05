import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";
import onlyWarn from "eslint-plugin-only-warn";
import type { Linter } from "eslint";

/**
 * Base ESLint configuration for the repository
 * Includes TypeScript, Prettier, and Turbo support
 */
const baseConfig: Linter.Config[] = [
  // JavaScript recommended rules
  js.configs.recommended as Linter.Config,

  // Disable rules that conflict with Prettier
  eslintConfigPrettier as Linter.Config,

  // TypeScript recommended rules
  ...(tseslint.configs.recommended as Linter.Config[]),

  // Turbo plugin for monorepo-specific rules
  {
    plugins: {
      turbo: turboPlugin as any,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  } satisfies Linter.Config,

  // Only warn plugin (optional - converts errors to warnings)
  {
    plugins: {
      onlyWarn: onlyWarn as any,
    },
  } satisfies Linter.Config,

  // Global ignores
  {
    ignores: [
      "dist/**",
      "build/**",
      "*.min.js",
      "*.d.ts",
      "node_modules/**",
      ".next/**",
      ".turbo/**",
      "coverage/**",
    ],
  } satisfies Linter.Config,

  // Custom rule overrides
  {
    rules: {
      // TypeScript rules
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],

      // General rules
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "warn",
    },
  } satisfies Linter.Config,
];

export default baseConfig;
