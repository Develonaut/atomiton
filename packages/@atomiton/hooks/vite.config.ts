import { defineLibraryConfig } from "@atomiton/vite-config";
import { resolve } from "path";

export default defineLibraryConfig({
  name: "AtomitonHooks",
  external: ["react", "react-dom"],
  testEnvironment: "jsdom",
  additionalConfig: {
    resolve: {
      alias: {
        "#": resolve(__dirname, "src"),
      },
    },
  },
});
