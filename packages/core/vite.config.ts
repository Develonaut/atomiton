import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    target: "node18",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "AtomitonCore",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      external: [
        "@atomiton/theme",
        "immer",
        "zustand",
        "events",
        "child_process",
        "crypto",
        "fs",
        "fs/promises",
        "path",
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
