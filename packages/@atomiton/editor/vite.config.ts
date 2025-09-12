import react from "@vitejs/plugin-react";
import { resolve } from "path";
import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";

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
        "@atomiton/core",
        "@atomiton/nodes",
        "@atomiton/ui",
        "@xyflow/react",
      ],
      output: {
        // Ensure CSS is bundled
        assetFileNames: "style.css",
      },
    },
    sourcemap: true,
    // Process CSS
    cssCodeSplit: false,
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
