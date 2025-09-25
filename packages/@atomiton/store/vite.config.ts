import { defineLibraryConfig } from "@atomiton/vite-config";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineLibraryConfig({
  name: "AtomitonStore",
  external: ["immer", "zustand"],
  chunks: {
    stores: "src/stores/",
    hooks: "src/hooks/",
    utils: "src/utils/",
  },
  additionalConfig: {
    plugins: [
      dts({
        insertTypesEntry: true,
        include: ["src/**/*.ts"],
        exclude: ["src/**/*.test.ts", "src/**/*.bench.ts"],
      }),
    ],
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
