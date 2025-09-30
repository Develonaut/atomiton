import { defineLibraryConfig } from "@atomiton/vite-config";

export default defineLibraryConfig({
  name: "AtomitonNodes",
  entry: {
    definitions: "./src/definitions/index.ts",
    executables: "./src/executables/index.ts",
    schemas: "./src/schemas/index.ts",
  },
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
  chunks: {
    definitions: (id) => id.includes("src/definitions"),
    executables: (id) => id.includes("src/executables"),
    factories: (id) => id.includes("src/core/factories"),
    schemas: (id) => id.includes("src/schemas"),
    vendor: (id) => id.includes("node_modules"),
  },
});
