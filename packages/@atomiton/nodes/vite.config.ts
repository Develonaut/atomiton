import { resolve } from "path";
import { defineLibraryConfig } from "@atomiton/vite-config";

export default defineLibraryConfig({
  name: "AtomitonNodes",
  external: [
    // Node.js built-ins
    "fs",
    "fs/promises",
    "path",
    "child_process",
    "os",
    "util",
    // Internal packages
    "@atomiton/validation",
    "@atomiton/yaml",
  ],
  chunks: {
    vendor: /node_modules/,
    atomic: /src\/atomic\//,
    composite: /src\/composite\//,
    validation: /validation/,
  },
  enableVisualizer: true,
  enableMinification: true,
  additionalConfig: {
    resolve: {
      alias: {
        "#": resolve(__dirname, "src"),
      },
    },
    build: {
      lib: {
        entry: {
          "exports/browser/index": resolve(
            __dirname,
            "src/exports/browser/index.ts",
          ),
          "exports/executable/index": resolve(
            __dirname,
            "src/exports/executable/index.ts",
          ),
        },
        name: "AtomitonNodes",
        formats: ["es"],
        fileName: (format, entryName) => {
          // Handle nested paths for exports
          if (entryName.includes("/")) {
            return entryName + ".js";
          }
          return `${entryName}.js`;
        },
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Split atomic nodes into individual chunks
            if (id.includes("src/atomic/")) {
              const nodeType = id.match(/src\/atomic\/([^/]+)/)?.[1];
              if (nodeType) {
                return `node-${nodeType}`;
              }
            }
            return undefined;
          },
        },
      },
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ["console.log", "console.debug"],
        },
        mangle: {
          keep_classnames: true,
          keep_fnames: true,
        },
      },
    },
  },
});
