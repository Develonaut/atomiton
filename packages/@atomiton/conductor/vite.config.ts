import { defineLibraryConfig } from "@atomiton/vite-config";

export default defineLibraryConfig({
  name: "AtomitonConductor",
  entry: {
    "exports/browser/index": "./src/exports/browser/index.ts",
    "exports/desktop/index": "./src/exports/desktop/index.ts",
    "test-utils/factories": "./src/test-utils/factories.ts",
  },
  external: [
    "@atomiton/nodes",
    "@atomiton/nodes/definitions",
    "@atomiton/nodes/executables",
    "@atomiton/utils",
    "@atomiton/rpc",
    "@atomiton/rpc/renderer",
    "@atomiton/rpc/shared",
    "isolated-vm",
    "fs",
    "fs/promises",
    "path",
    "os",
    "child_process",
    "electron",
  ],
  chunks: {
    vendor: (id) => id.includes("node_modules"),
  },
});
