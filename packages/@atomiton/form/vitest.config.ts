import path from "path";
import { defineTestConfig } from "@atomiton/vite-config/vitest";

export default defineTestConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
