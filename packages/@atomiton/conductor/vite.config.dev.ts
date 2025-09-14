import { defineConfig } from "vite";
import { resolve } from "path";

/**
 * Development configuration for Vite
 * Optimized for faster builds and HMR during development
 */
export default defineConfig({
  build: {
    watch: {
      include: "src/**",
    },
    sourcemap: "inline",
    minify: false,
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        browser: resolve(__dirname, "src/browser.ts"),
      },
      formats: ["es"],
      fileName: (format, entryName) => `${entryName}.js`,
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
        // Node.js built-ins
        "fs",
        "fs/promises",
        "path",
        "crypto",
        "util",
        "os",
        "events",
        /^node:/,
      ],
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("development"),
  },
  server: {
    watch: {
      usePolling: true,
    },
  },
});
