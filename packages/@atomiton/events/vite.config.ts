import { defineLibraryConfig } from "@atomiton/vite-config";
import { resolve } from "path";

export default defineLibraryConfig({
  name: "AtomitonEvents",
  external: [
    // Node.js built-ins
    "events",
    "util",
    // External packages
    "eventemitter3",
    // Electron (dynamically required)
    "electron",
  ],
  chunks: {
    vendor: /node_modules/,
    utils: /src\/utils/,
  },
  enableVisualizer: false,
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
          browser: resolve(__dirname, "src/exports/browser/index.ts"),
          desktop: resolve(__dirname, "src/exports/desktop/index.ts"),
        },
        name: "AtomitonEvents",
        formats: ["es", "cjs"],
      },
    },
  },
});
