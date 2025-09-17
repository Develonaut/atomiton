import { defineLibraryConfig } from "@atomiton/vite-config";

export default defineLibraryConfig({
  name: "AtomitonYaml",
  entry: "./src/index.ts",
  external: ["yaml"],
  chunks: {
    parsers: "src/parsers/",
    serializers: "src/serializers/",
    utils: "src/utils/",
  },
});
