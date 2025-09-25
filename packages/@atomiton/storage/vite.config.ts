import { resolve } from "path";
import { defineLibraryConfig } from "@atomiton/vite-config";

export default defineLibraryConfig({
  name: "AtomitonStorage",
  external: [
    // Bundle @atomiton/nodes to avoid module resolution issues in Electron
    // "@atomiton/nodes",
    "fs",
    "fs/promises",
    "path",
    "crypto",
    "util",
    "os",
    "events",
    /^node:/,
  ],
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
          index: resolve(__dirname, "src/index.ts"),
          "exports/browser/index": resolve(
            __dirname,
            "src/exports/browser/index.ts",
          ),
          "exports/desktop/index": resolve(
            __dirname,
            "src/exports/desktop/index.ts",
          ),
        },
        name: "AtomitonStorage",
        formats: ["es", "cjs"],
      },
    },
  },
});
