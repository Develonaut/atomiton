import { defineConfig } from "vite";
import { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/*.test.ts", "src/**/*.bench.ts"],
    }),
  ],
  build: {
    target: "es2020",
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        vitest: resolve(__dirname, "src/presets/vitest.ts"),
        playwright: resolve(__dirname, "src/presets/playwright.ts"),
      },
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: [
        "vite",
        "path",
        "url",
        "@vitejs/plugin-react",
        "rollup-plugin-visualizer",
        "vite-plugin-dts",
        "vite-tsconfig-paths",
        "@tailwindcss/vite",
        "@playwright/test",
        /^node:/,
      ],
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
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
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.debug"],
      },
      mangle: {
        keep_classnames: true,
        keep_fnames: true,
      },
    },
    sourcemap: true,
    reportCompressedSize: true,
  },
  test: {
    environment: "node",
    globals: true,
  },
});
