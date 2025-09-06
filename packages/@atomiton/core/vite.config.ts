import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    target: "es2020",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "AtomitonCore",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      external: [
        // External packages
        "@atomiton/store",
        "@atomiton/events",
        "@atomiton/nodes",
        "immer",
        "zustand",

        // Node.js built-in modules
        "child_process",
        "crypto",
        "events",
        "fs",
        "fs/promises",
        "path",
        "stream",
        "util",
        "os",
        "node:events",
        "node:stream",
        "node:child_process",
        "node:fs",
        "node:fs/promises",
        "node:path",
        "node:crypto",
        "node:util",
        "node:os",

        // Other potential Node.js dependencies
        "minipass",
        /^node:/,
      ],
    },
    sourcemap: true,
  },
  test: {
    environment: "node",
    setupFiles: ["./src/test-setup.ts"],
    globals: true,
  },
});
