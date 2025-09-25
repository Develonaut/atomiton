import { defineLibraryConfig } from "@atomiton/vite-config";
import { resolve } from "path";

export default defineLibraryConfig({
  name: "AtomitonConductor",
  entry: {
    "browser/index": "./src/browser/index.ts",
    "desktop/index": "./src/desktop/index.ts",
  },
  external: [
    "@atomiton/events",
    // Bundle @atomiton/nodes to avoid module resolution issues in Electron
    // "@atomiton/nodes",
    // "@atomiton/nodes/executables",
    // "@atomiton/nodes/definitions",
    "@atomiton/storage",
    "@atomiton/store",
    "@atomiton/utils",
    "p-queue",
    "isolated-vm",
    "child_process",
    "fs",
    "fs/promises",
    "path",
    "crypto",
    "util",
    "os",
    "events",
    "stream",
    "worker_threads",
    "url",
    /^node:/,
  ],
  chunks: {
    vendor: ["node_modules"],
    core: ["src/core/"],
    browser: ["src/browser/"],
    desktop: ["src/desktop/"],
    shared: ["src/shared/"],
  },
  enableVisualizer: true,
  enableMinification: false,
  enableSourceMap: true,
  additionalConfig: {
    resolve: {
      alias: {
        "#core": resolve(__dirname, "src/core"),
        "#browser": resolve(__dirname, "src/browser"),
        "#desktop": resolve(__dirname, "src/desktop"),
        "#shared": resolve(__dirname, "src/shared"),
      },
    },
  },
});
