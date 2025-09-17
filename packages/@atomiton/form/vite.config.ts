import { defineReactLibraryConfig } from "@atomiton/vite-config";

export default defineReactLibraryConfig({
  name: "AtomitonForm",
  external: ["@atomiton/ui", "@hookform/resolvers", "react-hook-form", "zod"],
  chunks: {
    components: ["src/components/"],
    hooks: ["src/hooks/"],
    utils: ["src/utils/"],
  },
});
