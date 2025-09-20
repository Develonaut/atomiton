import { defineIntegrationTestConfig } from "@atomiton/vite-config";
import path from "path";

export default defineIntegrationTestConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/__tests__/test-setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
