import { defineReactLibraryConfig } from "@atomiton/vite-config";
import { resolve } from "path";

export default defineReactLibraryConfig({
  name: "AtomitonRouter",
  external: ["@tanstack/react-router", "@atomiton/store", "zustand"],
  additionalConfig: {
    resolve: {
      alias: {
        "#": resolve(__dirname, "src"),
      },
    },
  },
});
