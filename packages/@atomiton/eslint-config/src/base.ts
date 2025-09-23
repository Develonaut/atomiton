import js from "@eslint/js";
import type { Linter } from "eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";

/**
 * Base ESLint configuration for the repository
 * Includes TypeScript, Prettier, and Turbo support
 */
const baseConfig: Linter.Config[] = [
  // JavaScript recommended rules
  js.configs.recommended,

  // TypeScript recommended rules
  ...tseslint.configs.recommended,

  // Turbo plugin for monorepo-specific rules
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  } satisfies Linter.Config,

  // Global ignores
  {
    ignores: [
      "dist/**",
      "build/**",
      "out/**",
      "*.min.js",
      "*.d.ts",
      "node_modules/**",
      ".next/**",
      ".turbo/**",
      "coverage/**",
      // Vite temporary files
      "**/*.timestamp-*.mjs",
      "**/*.timestamp-*.js",
      "**/vite.config.*.timestamp-*",
    ],
  } satisfies Linter.Config,

  // Custom rule overrides
  {
    rules: {
      // TypeScript rules
      "@typescript-eslint/no-explicit-any": "error",
      // Prefer type over interface, but interface is still allowed for:
      // - Module augmentation (extending global interfaces)
      // - Declaration merging
      // - When extending other interfaces
      "@typescript-eslint/consistent-type-definitions": ["warn", "type"],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      // Enforce consistent type imports
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports",
          disallowTypeAnnotations: true,
        },
      ],
      // Remove unused imports automatically
      "@typescript-eslint/no-unused-expressions": "error",
      "no-unused-vars": "off", // Use TypeScript's version instead

      // General rules
      "no-console": [
        "warn",
        { allow: ["warn", "error", "group", "groupEnd", "table", "log"] },
      ],
      "prefer-const": "warn",

      // Dead code detection rules
      "no-unreachable": "error",
      "no-unreachable-loop": "error",
      "no-unused-expressions": "off", // Using TypeScript version above
      "no-useless-return": "error",
      "no-lone-blocks": "error",
      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-useless-catch": "error",
      "no-constant-condition": ["error", { checkLoops: false }],

      // Import restrictions for # imports
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*", "./*"],
              message:
                "Use '#' imports instead of relative paths for internal imports",
            },
          ],
        },
      ],
    },
  } satisfies Linter.Config,

  // Disable rules that conflict with Prettier (must be last)
  eslintConfigPrettier,
];

export default baseConfig;
