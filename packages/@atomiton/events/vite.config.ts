import { defineLibraryConfig } from "@atomiton/vite-config";

export default defineLibraryConfig({
  name: "AtomitonEvents",
  external: ["eventemitter3", "events", "util", /^node:/],
  chunks: {
    events: "src/events/",
    emitters: "src/emitters/",
    utils: "src/utils/",
  },
});