import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import type { AppOptions } from "../types";

export function defineAppConfig(options: AppOptions): UserConfig {
  const {
    port = 5173,
    strictPort = true,
    workspacePackages = [],
    aliases = {},
    enableTailwind = true,
    additionalConfig = {},
  } = options;

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const workspaceRoot = resolve(__dirname, "../..");

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
    optimizeDeps: {
      exclude: workspacePackages,
    },
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
      assetsInlineLimit: 4096,
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            const fileName = assetInfo.names?.[0] || assetInfo.name || "asset";
            const info = fileName.split(".");
            const extType = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              return `images/[name]-[hash][extname]`;
            }
            if (/woff2?|eot|ttf|otf/i.test(extType)) {
              return `fonts/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
        },
      },
    },
    define: {
      global: "globalThis",
      "process.env": {},
    },
    assetsInclude: [
      "**/*.png",
      "**/*.jpg",
      "**/*.jpeg",
      "**/*.svg",
      "**/*.gif",
      "**/*.webp",
    ],
  };

  return defineConfig(mergeConfig(baseConfig, additionalConfig));
}

function mergeConfig(base: UserConfig, additional: UserConfig): UserConfig {
  return {
    ...base,
    ...additional,
    plugins: [
      ...(Array.isArray(base.plugins) ? base.plugins : []),
      ...(Array.isArray(additional.plugins) ? additional.plugins : []),
    ],
    server: {
      ...base.server,
      ...additional.server,
    },
    optimizeDeps: {
      ...base.optimizeDeps,
      ...additional.optimizeDeps,
      exclude: [
        ...(base.optimizeDeps?.exclude || []),
        ...(additional.optimizeDeps?.exclude || []),
      ],
    },
    resolve: {
      ...base.resolve,
      ...additional.resolve,
      alias: {
        ...base.resolve?.alias,
        ...additional.resolve?.alias,
      },
    },
    build: {
      ...base.build,
      ...additional.build,
    },
    define: {
      ...base.define,
      ...additional.define,
    },
  };
}
