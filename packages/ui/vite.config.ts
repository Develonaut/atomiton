import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss()],
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
      // Allow serving files from the theme package
      allow: ["..", "../../packages/theme"],
    },
    watch: {
      // Watch the theme package source files for changes
      ignored: ["!**/packages/theme/src/**"],
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    // Asset optimization
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    rollupOptions: {
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
        // Chunk splitting for better caching
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: [
            "@headlessui/react",
            "react-animate-height",
            "react-textarea-autosize",
          ],
        },
      },
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
