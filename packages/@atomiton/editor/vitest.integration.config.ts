import { defineIntegrationTestConfig } from "@atomiton/vite-config/vitest";

export default defineIntegrationTestConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/__tests__/test-setup.ts"],
  },
});
