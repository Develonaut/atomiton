import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    tailwindcss(),
    dts({
      insertTypesEntry: true,
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    port: parseInt(process.env.VITE_UI_PORT || "5174"),
    strictPort: true, // Fail if port is already in use instead of auto-incrementing
    host: true,
    fs: {
      // Allow serving files from parent directories
      allow: [".."],
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
  },
  build: {
    target: "es2020",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "AtomitonUI",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
    },
    outDir: "dist",
    sourcemap: true,
    // Asset optimization
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    // Enable minification and compression
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ["console.log", "console.debug"],
      },
      mangle: {
        keep_classnames: true, // Keep class names for CSS-in-JS and debugging
        keep_fnames: true, // Keep function names for debugging
      },
    },
    reportCompressedSize: true,
    rollupOptions: {
      external: [
        // Peer dependencies that should not be bundled
        "react",
        "react-dom",
        "react/jsx-runtime",
      ],
      output: {
        // Asset file naming
        assetFileNames: (assetInfo) => {
          const fileName = assetInfo.names?.[0] || assetInfo.name || "asset";
          const info = fileName.split(".");
          const extType = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(extType)) {
            return `fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        // Enhanced chunk splitting for better tree shaking
        manualChunks(id) {
          // Keep node modules as separate chunks
          if (id.includes("node_modules")) {
            // Split common UI libraries
            if (id.includes("@headlessui")) return "headlessui";
            if (id.includes("@radix-ui")) return "radix";
            if (id.includes("lucide-react")) return "icons";
            if (id.includes("react-")) return "react-utils";
            return "vendor";
          }

          // Split components into logical chunks
          if (id.includes("src/components/")) {
            const componentType = id.match(/src\/components\/([^/]+)/)?.[1];
            if (componentType) {
              return `component-${componentType}`;
            }
          }

          // Split theme and styling
          if (id.includes("theme") || id.includes("style")) {
            return "theme";
          }

          // Split utilities
          if (id.includes("utils") || id.includes("lib")) {
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
  },
  // Define global constants for compatibility
  define: {
    global: "globalThis",
    "process.env": {},
  },
  // Asset processing
  assetsInclude: [
    "**/*.png",
    "**/*.jpg",
    "**/*.jpeg",
    "**/*.svg",
    "**/*.gif",
    "**/*.webp",
  ],
});
