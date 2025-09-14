import react from "@vitejs/plugin-react";
import { resolve } from "path";
import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    }),
  ],
  server: {
    port: parseInt(process.env.VITE_EDITOR_PORT || "5175"),
    strictPort: true,
    host: true,
    fs: {
      // Allow serving files from parent directories
      allow: [".."],
    },
  },
  build: {
    target: "es2020",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "AtomitonEditor",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "@atomiton/hooks",
        "@atomiton/nodes",
        "@atomiton/store",
        "@atomiton/ui",
        "@xyflow/react",
      ],
      output: {
        // Ensure CSS is bundled
        assetFileNames: "style.css",
        // Enable manual chunks for better tree shaking
        manualChunks(id) {
          // Keep node modules as separate chunks
          if (id.includes("node_modules")) {
            if (id.includes("@xyflow/react")) return "xyflow";
            return "vendor";
          }

          // Split editor functionality
          if (id.includes("src/components/")) {
            return "components";
          }

          if (id.includes("src/nodes/")) {
            return "nodes";
          }

          if (id.includes("src/hooks/") || id.includes("src/lib/")) {
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
        keep_classnames: true, // Keep class names for CSS and debugging
        keep_fnames: true, // Keep function names for debugging
      },
    },
    sourcemap: true,
    // Process CSS
    cssCodeSplit: false,
    reportCompressedSize: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    exclude: ["**/tests/**", "**/node_modules/**", "**/*.spec.ts"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
