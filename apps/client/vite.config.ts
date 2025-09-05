import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss()],
  server: {
    port: 3001,
    host: true,
    // Watch workspace packages for HMR
    watch: {
      // Watch all files in workspace packages
      ignored: [
        "!**/node_modules/@atomiton/**",
        "!**/node_modules/packages/**",
      ],
    },
    fs: {
      // Allow serving files from workspace packages
      allow: [
        // Default allowed paths
        ".",
        // Add workspace package paths
        path.resolve(__dirname, "../../packages"),
        path.resolve(__dirname, "../../node_modules"),
      ],
    },
  },
  // Optimize deps to include workspace packages for better HMR
  optimizeDeps: {
    include: ["@atomiton/ui", "@atomiton/theme"],
    exclude: [],
    // Force pre-bundling of linked packages
    entries: ["src/main.tsx"],
  },
  resolve: {
    // Ensure proper resolution of workspace packages
    alias: {
      "@atomiton/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@atomiton/theme": path.resolve(
        __dirname,
        "../../packages/@atomiton/theme/src",
      ),
    },
    // Preserve symlinks for workspace packages
    preserveSymlinks: false,
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
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["framer-motion", "react-tooltip"],
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
