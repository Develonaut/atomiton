import type { LibraryOptions } from "#types";
import { createManualChunks } from "#utils/chunks";
import { mergeViteConfig } from "#utils/merge";
import { getTerserOptions } from "#utils/terser";
import { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, type UserConfig, type LibraryFormats } from "vite";
import dts from "vite-plugin-dts";

function createMultiEntryLib(entry: Record<string, string>, name: string) {
  return {
    entry: Object.entries(entry).reduce(
      (acc, [key, path]) => ({
        ...acc,
        [key]: resolve(process.cwd(), path),
      }),
      {} as Record<string, string>,
    ),
    name,
    formats: ["es", "cjs"] as LibraryFormats[],
    fileName: (format: string, entryName: string) =>
      `${entryName}.${format === "es" ? "js" : "cjs"}`,
  };
}

function createSingleEntryLib(entry: string, name: string) {
  return {
    entry: resolve(process.cwd(), entry),
    name,
    formats: ["es", "cjs"] as LibraryFormats[],
    fileName: (format: string) => `index.${format === "es" ? "js" : "cjs"}`,
  };
}

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

  const isMultiEntry = typeof entry === "object";

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

  const libConfig = isMultiEntry
    ? createMultiEntryLib(entry as Record<string, string>, name)
    : createSingleEntryLib(entry as string, name);

  const baseConfig: UserConfig = {
    plugins,
    build: {
      target: "es2020",
      lib: libConfig,
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
