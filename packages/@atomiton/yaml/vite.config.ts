import { defineLibraryConfig } from "@atomiton/vite-config";
import { resolve } from "path";

export default defineLibraryConfig({
  name: "AtomitonYaml",
  entry: "./src/index.ts",
  external: ["yaml"],
  chunks: {
    parsers: "src/parsers/",
    serializers: "src/serializers/",
    utils: "src/utils/",
  },
  additionalConfig: {
    resolve: {
      alias: {
        "#": resolve(__dirname, "src"),
      },
    },
  },
});
