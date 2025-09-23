import { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: ["src/**/*.test.ts", "src/**/*.test.tsx", "src/**/*.bench.ts"],
    }),
    visualizer({
      filename: "dist/stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
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
      onLog(level, log, handler) {
        // Detect Node.js built-ins in browser code
        if (log.code === "UNRESOLVED_IMPORT") {
          const nodeBuiltins = [
            "fs",
            "path",
            "child_process",
            "os",
            "util",
            "crypto",
            "stream",
            "http",
            "https",
          ];
          if (nodeBuiltins.some((builtin) => log.message.includes(builtin))) {
            console.error(
              `❌ ERROR: Node.js built-in imported in browser code: ${log.message}`,
            );
            return;
          }
        }
        handler(level, log);
      },
      external: [
        // Node.js built-ins - these should ONLY be in desktop build
        "fs",
        "fs/promises",
        "node:fs",
        "node:fs/promises",
        "path",
        "node:path",
        "child_process",
        "node:child_process",
        "os",
        "node:os",
        "util",
        "node:util",
        "crypto",
        "node:crypto",
        "stream",
        "node:stream",
        "http",
        "node:http",
        "https",
        "node:https",
        // External libraries for Node.js runtime
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
          if (id.includes("src/core/types")) return "types";
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
