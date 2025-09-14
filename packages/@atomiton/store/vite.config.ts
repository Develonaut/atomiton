import { defineConfig } from "vite";
import { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";
import dts from "vite-plugin-dts";

export default defineConfig({
  define: {
    // Ensure Redux DevTools are available in development
    __DEV__: process.env.NODE_ENV !== "production",
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    }),
  ],
  build: {
    target: "es2020",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "AtomitonStore",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      external: [
        // External packages
        "immer",
        "zustand",
      ],
      output: {
        // Enable manual chunks for better tree shaking
        manualChunks(id) {
          // Keep node modules as separate chunks
          if (id.includes("node_modules")) {
            return "vendor";
          }

          // Split store functionality
          if (id.includes("src/stores/")) {
            return "stores";
          }

          if (id.includes("src/hooks/")) {
            return "hooks";
          }

          if (id.includes("src/utils/")) {
            return "utils";
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
    // Enable minification and compression only in production
    minify: process.env.NODE_ENV === "production" ? "terser" : false,
    terserOptions:
      process.env.NODE_ENV === "production"
        ? {
            compress: {
              drop_console: true, // Remove console.log in production
              drop_debugger: true,
              pure_funcs: ["console.log", "console.debug"],
            },
            mangle: {
              keep_classnames: true, // Keep class names for debugging
              keep_fnames: true, // Keep function names for debugging
            },
          }
        : undefined,
    sourcemap: true,
    reportCompressedSize: true,
  },
  test: {
    environment: "node",
    globals: true,
  },
});
