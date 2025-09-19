import { resolve } from "path";
import { defineLibraryConfig } from "@atomiton/vite-config";

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
    build: {
      lib: {
        entry: {
          index: resolve(__dirname, "src/index.ts"),
          browser: resolve(__dirname, "src/exports/browser/index.ts"),
          desktop: resolve(__dirname, "src/exports/desktop/index.ts"),
        },
        name: "AtomitonEvents",
        formats: ["es", "cjs"],
      },
    },
  },
});
