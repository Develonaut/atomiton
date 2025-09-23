import { resolve } from "path";
import { defineConfig, type UserConfig } from "vite";
import dts from "vite-plugin-dts";
import { visualizer } from "rollup-plugin-visualizer";
import { getTerserOptions } from "#utils/terser";
import { createManualChunks } from "#utils/chunks";
import { mergeViteConfig } from "#utils/merge";
import type { LibraryOptions } from "#types";

export function defineLibraryConfig(options: LibraryOptions): UserConfig {
  const {
    name,
    entry = "./src/index.ts",
    external = [],
    chunks = {},
    enableVisualizer = true,
    enableMinification = true,
    enableSourceMap = true,
    assetsInlineLimit = 4096,
    additionalConfig = {},
  } = options;

  const plugins = [
    dts({
      insertTypesEntry: true,
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: [
        "src/**/*.test.ts",
        "src/**/*.test.tsx",
        "src/**/*.test.ts",
        "src/**/*.bench.ts",
      ],
    }),
  ];

  if (enableVisualizer) {
    plugins.push(
      visualizer({
        filename: "dist/stats.html",
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),
    );
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
      sourcemap: enableSourceMap,
      reportCompressedSize: true,
      assetsInlineLimit,
    },
  };

  return defineConfig(mergeViteConfig(baseConfig, additionalConfig));
}
