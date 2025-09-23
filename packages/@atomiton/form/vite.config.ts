import { defineReactLibraryConfig } from "@atomiton/vite-config";
import { resolve } from "path";

export default defineReactLibraryConfig({
  name: "AtomitonForm",
  external: ["@atomiton/ui", "@hookform/resolvers", "react-hook-form"],
  chunks: {
    components: ["src/components/"],
    hooks: ["src/hooks/"],
    utils: ["src/utils/"],
  },
  additionalConfig: {
    resolve: {
      alias: {
        "#": resolve(__dirname, "src"),
      },
    },
  },
});
