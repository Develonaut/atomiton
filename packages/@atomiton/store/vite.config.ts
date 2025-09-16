import { defineLibraryConfig } from "@atomiton/vite-config";

export default defineLibraryConfig({
  name: "AtomitonStore",
  external: ["immer", "zustand"],
  chunks: {
    stores: "src/stores/",
    hooks: "src/hooks/",
    utils: "src/utils/",
  },
  additionalConfig: {
    define: {
      __DEV__: process.env.NODE_ENV !== "production",
    },
  },
});