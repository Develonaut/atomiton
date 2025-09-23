import { defineLibraryConfig } from "@atomiton/vite-config";
import { resolve } from "path";

export default defineLibraryConfig({
  name: "AtomitonStore",
  external: ["immer", "zustand"],
  chunks: {
    stores: "src/stores/",
    hooks: "src/hooks/",
    utils: "src/utils/",
  },
  additionalConfig: {
    resolve: {
      alias: {
        "#": resolve(__dirname, "src"),
      },
    },
    define: {
      __DEV__: process.env.NODE_ENV !== "production",
    },
  },
});
