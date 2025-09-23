import { resolve } from "path";
import { defineLibraryConfig } from "@atomiton/vite-config";

export default defineLibraryConfig({
  name: "AtomitonUtils",
  external: ["node:path", "node:fs", "node:url", "node:crypto"],
  additionalConfig: {
    resolve: {
      alias: {
        "#": resolve(__dirname, "src"),
      },
    },
  },
});
