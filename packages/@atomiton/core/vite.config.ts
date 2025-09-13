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
      entry: resolve(__dirname, "src/index.ts"),
      name: "AtomitonCore",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      external: [
        // External packages
        "@atomiton/store",
        "@atomiton/events",
        "@atomiton/nodes",
        "@atomiton/ui",
        "immer",
        "zustand",

        // Node.js built-in modules
        "child_process",
        "crypto",
        "events",
        "fs",
        "fs/promises",
        "path",
        "stream",
        "util",
        "os",
        "node:events",
        "node:stream",
        "node:child_process",
        "node:fs",
        "node:fs/promises",
        "node:path",
        "node:crypto",
        "node:util",
        "node:os",

        // Other potential Node.js dependencies
        "minipass",
        /^node:/,
      ],
      output: {
        // Enable manual chunks for better tree shaking
        manualChunks(id) {
          // Keep node modules as separate chunks
          if (id.includes("node_modules")) {
            return "vendor";
          }

          // Split core functionality into logical chunks
          if (id.includes("src/blueprint/")) {
            return "blueprint";
          }

          if (id.includes("src/engine/")) {
            return "engine";
          }

          if (id.includes("src/state/")) {
            return "state";
          }

          if (id.includes("src/validation/")) {
            return "validation";
          }

          // Split utilities
          if (id.includes("src/utils/") || id.includes("src/lib/")) {
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
        keep_classnames: true, // Keep class names for reflection
        keep_fnames: true, // Keep function names for debugging
      },
    },
    sourcemap: true,
    // Enable compression reporting
    reportCompressedSize: true,
  },
  test: {
    environment: "node",
    setupFiles: ["./src/test-setup.ts"],
    globals: true,
  },
});
