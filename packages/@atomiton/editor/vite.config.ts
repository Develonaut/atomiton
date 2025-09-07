import { resolve } from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
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
        "@atomiton/core",
        "@atomiton/nodes",
        "@atomiton/ui",
        "@xyflow/react",
      ],
    },
    sourcemap: true,
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
