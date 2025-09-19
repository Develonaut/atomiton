import { resolve } from "path";
import { defineLibraryConfig } from "@atomiton/vite-config";

export default defineLibraryConfig({
  name: "AtomitonStorage",
  external: [
    "@atomiton/nodes",
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
    build: {
      lib: {
        entry: {
          index: resolve(__dirname, "src/index.ts"),
          browser: resolve(__dirname, "src/browser.ts"),
          desktop: resolve(__dirname, "src/desktop.ts"),
        },
        name: "AtomitonStorage",
        formats: ["es", "cjs"],
      },
    },
  },
});
