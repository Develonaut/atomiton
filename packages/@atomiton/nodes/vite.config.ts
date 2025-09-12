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
        // React & UI libraries
        "react",
        "react-dom",
        "@mantine/core",
        "@tabler/icons-react",
        "@xyflow/react",
        // Node.js built-ins
        "fs",
        "fs/promises",
        "path",
        "child_process",
        "os",
        "util",
        // Third-party libraries
        "chokidar",
        "eventemitter3",
        "glob",
        "zod",
      ],
    },
    sourcemap: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
  },
});
