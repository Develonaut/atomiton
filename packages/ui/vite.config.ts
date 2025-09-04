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
      "@atomiton/theme": resolve(__dirname, "../theme/src/index.ts"),
    },
  },
  server: {
    host: true,
    fs: {
      // Allow serving files from the theme package
      allow: ["..", "../../packages/theme"],
    },
    watch: {
      // Watch the theme package source files for changes
      ignored: [
        "!**/node_modules/@atomiton/theme/**",
        "!**/packages/theme/src/**",
      ],
    },
  },
  optimizeDeps: {
    // Force Vite to re-optimize when theme changes
    exclude: ["@atomiton/theme"],
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
          const info = assetInfo.name!.split(".");
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
