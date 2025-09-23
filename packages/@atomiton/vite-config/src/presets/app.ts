import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import type { AppOptions } from "#types";
import {
  getAssetFileName,
  DEFAULT_ASSETS_INCLUDE,
  DEFAULT_INLINE_LIMIT,
} from "#utils/assets";
import { getOptimizeDepsConfig } from "#utils/optimizeDeps";
import { mergeViteConfig } from "#utils/merge";

export function defineAppConfig(options: AppOptions): UserConfig {
  const {
    port = 5173,
    strictPort = true,
    workspacePackages = [],
    aliases = {},
    enableTailwind = true,
    assetsInlineLimit = DEFAULT_INLINE_LIMIT,
    chunkSizeWarningLimit = 500,
    additionalConfig = {},
  } = options;

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const workspaceRoot = resolve(__dirname, "../../../../..");

  const plugins = [react(), tsconfigPaths()];

  if (enableTailwind) {
    plugins.push(tailwindcss());
  }

  const baseConfig: UserConfig = {
    plugins,
    server: {
      port,
      strictPort,
      host: true,
      fs: {
        allow: [workspaceRoot],
      },
    },
    optimizeDeps: getOptimizeDepsConfig({ workspacePackages }),
    resolve: {
      alias: Object.entries(aliases).reduce(
        (acc, [key, value]) => {
          acc[key] = resolve(process.cwd(), value);
          return acc;
        },
        {} as Record<string, string>,
      ),
    },
    build: {
      outDir: "dist",
      sourcemap: true,
      assetsInlineLimit,
      chunkSizeWarningLimit,
      rollupOptions: {
        output: {
          assetFileNames: getAssetFileName,
        },
      },
    },
    define: {
      global: "globalThis",
      "process.env": {},
    },
    assetsInclude: DEFAULT_ASSETS_INCLUDE,
  };

  return defineConfig(mergeViteConfig(baseConfig, additionalConfig));
}
