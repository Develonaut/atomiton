import { defineReactLibraryConfig } from "@atomiton/vite-config";

export default defineReactLibraryConfig({
  name: "AtomitonRouter",
  external: ["@tanstack/react-router", "@atomiton/store", "zustand"],
});
