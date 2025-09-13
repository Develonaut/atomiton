import { defineConfig } from "vite";
import { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  build: {
    target: "node18",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "AtomitonDI",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
    },
    rollupOptions: {
      external: ["reflect-metadata", "tsyringe"],
      output: {
        // Enable manual chunks for better tree shaking
        manualChunks(id) {
          // Keep node modules as separate chunks
          if (id.includes("node_modules")) {
            return "vendor";
          }

          // Split DI functionality
          if (id.includes("src/decorators/")) {
            return "decorators";
          }

          if (id.includes("src/container/")) {
            return "container";
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
        keep_classnames: true, // Keep class names for reflection
        keep_fnames: true, // Keep function names for debugging
      },
    },
    sourcemap: true,
    emptyOutDir: true,
    reportCompressedSize: true,
  },
});
