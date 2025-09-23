import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/*.bench.ts"],
    }),
  ],
  build: {
    target: "es2020",
    lib: {
      entry: {
        definitions: resolve(__dirname, "src/definitions/index.ts"),
        executables: resolve(__dirname, "src/executables/index.ts"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        // Node.js built-ins
        /^node:/,
        "fs",
        "fs/promises",
        "path",
        "child_process",
        "os",
        "util",
        "crypto",
        "stream",
        "http",
        "https",
        // External libraries
        "sharp",
        "execa",
        "isolated-vm",
        // Internal packages
        "@atomiton/validation",
        "@atomiton/yaml",
        "@atomiton/store",
        "@atomiton/utils",
      ],
      output: {
        manualChunks: (id) => {
          // Separate chunks for better analysis
          if (id.includes("src/definitions")) return "definitions";
          if (id.includes("src/executables")) return "executables";
          if (id.includes("src/core/factories")) return "factories";
          if (id.includes("src/schemas")) return "schemas";
          if (id.includes("node_modules")) return "vendor";
        },
      },
    },
    sourcemap: true,
    reportCompressedSize: true,
  },
  resolve: {
    alias: {
      "#": resolve(__dirname, "src"),
    },
  },
});
