import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    target: "node18",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "AtomitonNodes",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      external: [
        // Node.js built-ins
        "fs",
        "fs/promises",
        "path",
        "child_process",
        "os",
        "util",
        // Third-party libraries
        "zod",
        // Internal packages
        "@atomiton/yaml",
      ],
    },
    sourcemap: true,
  },
});
