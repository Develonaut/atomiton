import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { type UserConfig, type PluginOption } from "vite";
import { defineLibraryConfig } from "#presets/library";
import type { ReactLibraryOptions } from "#types";

export function defineReactLibraryConfig(
  options: ReactLibraryOptions,
): UserConfig {
  const {
    enableTailwind = false,
    enableTsconfigPaths = true,
    external = [],
    optimizeDeps,
    additionalConfig = {},
    ...libraryOptions
  } = options;

  const plugins: PluginOption[] = [react()];

  if (enableTsconfigPaths) {
    plugins.push(tsconfigPaths());
  }

  if (enableTailwind) {
    plugins.push(tailwindcss() as PluginOption);
  }

  const reactExternal = [
    "react",
    "react-dom",
    "react/jsx-runtime",
    ...external,
  ];

  return defineLibraryConfig({
    ...libraryOptions,
    external: reactExternal,
    additionalConfig: {
      ...additionalConfig,
      plugins: [
        ...plugins,
        ...(Array.isArray(additionalConfig.plugins)
          ? additionalConfig.plugins
          : []),
      ],
      resolve: {
        ...additionalConfig.resolve,
      },
      optimizeDeps: optimizeDeps || additionalConfig.optimizeDeps,
    },
  });
}
