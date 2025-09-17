import { defineLibraryConfig } from "@atomiton/vite-config";

export default defineLibraryConfig({
  name: "AtomitonHooks",
  external: ["react", "react-dom"],
  testEnvironment: "jsdom",
});
