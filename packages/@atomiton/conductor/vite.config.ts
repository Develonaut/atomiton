import { defineConfig } from "vite";
import { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";
import dts from "vite-plugin-dts";

export default defineConfig({
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
      name: "AtomitonConductor",
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: [
        // External packages
        "@atomiton/events",
        "@atomiton/nodes",
        "@atomiton/storage",
        "@atomiton/store",
        "@atomiton/utils",
        "p-queue",
        "uuid",
        "electron",
        // Node.js built-ins
        "fs",
        "fs/promises",
        "path",
        "crypto",
        "util",
        "os",
        "events",
        "stream",
        "worker_threads",
        /^node:/,
      ],
      output: {
        // Enable manual chunks for better tree shaking
        manualChunks(id) {
          // Keep node modules as separate chunks
          if (id.includes("node_modules")) {
            return "vendor";
          }

          // Split conductor functionality following BENTO_BOX_PRINCIPLE
          if (id.includes("src/engine/enhanced/")) {
            return "engine-enhanced";
          }

          if (id.includes("src/engine/")) {
            return "engine";
          }

          if (id.includes("src/execution/composite/")) {
            return "execution-composite";
          }

          if (id.includes("src/execution/")) {
            return "execution";
          }

          if (id.includes("src/queue/core/")) {
            return "queue-core";
          }

          if (id.includes("src/queue/")) {
            return "queue";
          }

          if (id.includes("src/store/")) {
            return "store";
          }

          if (id.includes("src/transport/")) {
            return "transport";
          }

          if (id.includes("src/electron/")) {
            return "electron";
          }

          if (id.includes("src/runtime/")) {
            return "runtime";
          }

          if (id.includes("src/simple/")) {
            return "simple";
          }

          if (id.includes("src/interfaces/")) {
            return "interfaces";
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
    environment: "node",
    globals: true,
  },
});
