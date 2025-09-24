import { defineLibraryConfig } from "@atomiton/vite-config";
import { resolve } from "path";

export default defineLibraryConfig({
  name: "AtomitonEvents",
  entry: {
    "browser/index": "./src/browser/index.ts",
    "desktop/index": "./src/desktop/index.ts",
  },
  external: [
    "eventemitter3",
    "node:events",
    "events",
    "util",
    "electron",
    "fs",
    "path",
    "process",
  ],
  enableVisualizer: true,
  enableMinification: true,
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
