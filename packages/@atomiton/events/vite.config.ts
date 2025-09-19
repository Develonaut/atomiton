import { resolve } from "path";
import { defineLibraryConfig } from "@atomiton/vite-config";

export default defineLibraryConfig({
  name: "AtomitonEvents",
  external: ["events", "eventemitter3"],
  additionalConfig: {
    build: {
      lib: {
        entry: {
          "exports/browser/index": resolve(
            __dirname,
            "src/exports/browser/index.ts",
          ),
          "exports/desktop/index": resolve(
            __dirname,
            "src/exports/desktop/index.ts",
          ),
        },
        name: "AtomitonEvents",
        formats: ["es"],
        fileName: (format, entryName) => {
          // Handle nested paths for exports
          if (entryName.includes("/")) {
            return entryName + ".js";
          }
          return `${entryName}.js`;
        },
      },
    },
  },
});
