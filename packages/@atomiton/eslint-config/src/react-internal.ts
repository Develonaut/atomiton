import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReact from "eslint-plugin-react";
import globals from "globals";
import baseConfig from "./base";
import type { Linter } from "eslint";

/**
 * ESLint configuration for React libraries and applications
 */
const reactConfig: Linter.Config[] = [
  ...baseConfig,

  // React plugin recommended rules
  pluginReact.configs.flat.recommended as Linter.Config,

  // Language options for React
  {
    languageOptions: {
      ...(pluginReact.configs.flat.recommended as Linter.Config)
        .languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  } satisfies Linter.Config,

  // React Hooks and additional settings
  {
    plugins: {
      "react-hooks": pluginReactHooks as any,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      // React scope no longer necessary with new JSX transform
      "react/react-in-jsx-scope": "off",
      // Prefer function declarations for React components (better debugging with automatic displayName)
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "function-declaration",
          unnamedComponents: "arrow-function",
        },
      ],
    },
  } satisfies Linter.Config,
];

export default reactConfig;
