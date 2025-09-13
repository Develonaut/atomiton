import { defineConfig } from "vite";
import { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react(),
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
      name: "AtomitonForm",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      external: [
        // External packages
        "@atomiton/ui",
        "@hookform/resolvers",
        "react-hook-form",
        "zod",
        "react",
        "react-dom",
        "react/jsx-runtime",
      ],
      output: {
        // Enable manual chunks for better tree shaking
        manualChunks(id) {
          // Keep node modules as separate chunks
          if (id.includes("node_modules")) {
            return "vendor";
          }

          // Split form functionality
          if (id.includes("src/components/")) {
            return "components";
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
    // Enable minification and compression
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ["console.log", "console.debug"],
      },
      mangle: {
        keep_classnames: true, // Keep class names for debugging
        keep_fnames: true, // Keep function names for debugging
      },
    },
    sourcemap: true,
    reportCompressedSize: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
});
