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
      name: "AtomitonNodes",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      external: [
        // Node.js built-ins
        "fs",
        "fs/promises",
        "path",
        "child_process",
        "os",
        "util",
        // Third-party libraries
        "zod",
        // Internal packages
        "@atomiton/yaml",
      ],
      output: {
        // Enable manual chunks for better tree shaking
        manualChunks(id) {
          // Keep node modules as separate chunks
          if (id.includes("node_modules")) {
            return "vendor";
          }

          // Split atomic nodes into individual chunks
          if (id.includes("src/atomic/")) {
            const nodeType = id.match(/src\/atomic\/([^/]+)/)?.[1];
            if (nodeType) {
              return `node-${nodeType}`;
            }
          }

          // Split composite functionality
          if (id.includes("src/composite/")) {
            return "composite";
          }

          // Split validation logic
          if (id.includes("validation")) {
            return "validation";
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
    // Enable compression
    reportCompressedSize: true,
  },
});
