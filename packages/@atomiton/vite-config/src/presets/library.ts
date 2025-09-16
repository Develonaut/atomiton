import { resolve } from "path";
import { defineConfig, type UserConfig } from "vite";
import { createDtsPlugin } from "../plugins/dts";
import { createVisualizerPlugin } from "../plugins/visualizer";
import { getTerserOptions } from "../utils/terser";
import { createManualChunks } from "../utils/chunks";
import type { LibraryOptions } from "../types";

export function defineLibraryConfig(options: LibraryOptions): UserConfig {
  const {
    name,
    entry = "./src/index.ts",
    external = [],
    chunks = {},
    enableVisualizer = true,
    enableMinification = true,
    testEnvironment = "node",
    additionalConfig = {},
  } = options;

  const plugins = [createDtsPlugin()];

  if (enableVisualizer) {
    plugins.push(createVisualizerPlugin());
  }

  const baseConfig: UserConfig = {
    plugins,
    build: {
      target: "es2020",
      lib: {
        entry: resolve(process.cwd(), entry),
        name,
        formats: ["es", "cjs"],
        fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
      },
      rollupOptions: {
        external,
        output: {
          manualChunks: createManualChunks(chunks),
        },
      },
      minify: enableMinification ? "terser" : false,
      terserOptions: enableMinification ? getTerserOptions() : undefined,
      sourcemap: true,
      reportCompressedSize: true,
    },
    test: {
      environment: testEnvironment,
      globals: true,
    },
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
    build: {
      ...base.build,
      ...additional.build,
      rollupOptions: {
        ...base.build?.rollupOptions,
        ...additional.build?.rollupOptions,
        external: [
          ...(Array.isArray(base.build?.rollupOptions?.external)
            ? base.build.rollupOptions.external
            : []),
          ...(Array.isArray(additional.build?.rollupOptions?.external)
            ? additional.build.rollupOptions.external
            : []),
        ],
      },
    },
    test: {
      ...base.test,
      ...additional.test,
    },
  };
}
