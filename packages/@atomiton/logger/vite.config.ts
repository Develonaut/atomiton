import { defineConfig } from "vite";
import { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts"],
    }),
  ],
  build: {
    target: "es2020",
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        "exports/desktop/index": resolve(
          __dirname,
          "src/exports/desktop/index.ts",
        ),
        "exports/browser/index": resolve(
          __dirname,
          "src/exports/browser/index.ts",
        ),
        "exports/shared/index": resolve(
          __dirname,
          "src/exports/shared/index.ts",
        ),
      },
      formats: ["es"],
      fileName: (format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: [
        "electron",
        "electron-log",
        "node:path",
        "node:fs",
        "node:os",
        "@atomiton/rpc",
        "@atomiton/rpc/renderer",
      ],
      plugins: [
        visualizer({
          filename: "dist/stats.html",
          open: false,
          gzipSize: true,
          brotliSize: true,
        }),
      ],
    },
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: false, // Keep console for logger itself
        drop_debugger: true,
      },
      mangle: {
        keep_classnames: true,
        keep_fnames: true,
      },
    },
    sourcemap: true,
    reportCompressedSize: true,
  },
  resolve: {
    alias: {
      "#": resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    globals: true,
  },
});
