import { defineLibraryConfig } from "@atomiton/vite-config";

export default defineLibraryConfig({
  name: "AtomitonStorage",
  external: [
    "@atomiton/nodes",
    "fs",
    "fs/promises",
    "path",
    "crypto",
    "util",
    "os",
    "events",
    /^node:/,
  ],
  chunks: {
    adapters: "src/adapters/",
    providers: "src/providers/",
    utils: "src/utils/",
  },
});
