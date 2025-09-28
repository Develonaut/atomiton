import { defineIntegrationTestConfig } from "@atomiton/vite-config/vitest";
import { resolve } from "path";

export default defineIntegrationTestConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/__tests__/test-setup.ts"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
