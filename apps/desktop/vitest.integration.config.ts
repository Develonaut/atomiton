import { defineIntegrationTestConfig } from "@atomiton/vite-config/vitest";

export default defineIntegrationTestConfig({
  test: {
    setupFiles: ["src/__tests__/test-setup.ts"],
  },
});
