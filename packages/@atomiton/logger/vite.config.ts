import { defineLibraryConfig } from "@atomiton/vite-config";
import { resolve } from "path";

export default defineLibraryConfig({
  name: "AtomitonLogger",
  entry: {
    "browser/index": "./src/browser/index.ts",
    "desktop/index": "./src/desktop/index.ts",
  },
  external: [
    "node:fs",
    "node:path",
    "node:os",
    "fs",
    "path",
    "os",
    "process",
    "electron",
  ],
  enableVisualizer: true,
  enableMinification: false,
  enableSourceMap: true,
  additionalConfig: {
    resolve: {
      alias: {
        "#browser": resolve(__dirname, "src/browser"),
        "#desktop": resolve(__dirname, "src/desktop"),
        "#shared": resolve(__dirname, "src/shared"),
      },
    },
  },
});
