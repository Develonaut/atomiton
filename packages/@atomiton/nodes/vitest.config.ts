import { defineTestConfig } from "@atomiton/vite-config/vitest";
import { resolve } from "path";

export default defineTestConfig({
  resolve: {
    alias: {
      "#": resolve(__dirname, "src"),
    },
  },
});
