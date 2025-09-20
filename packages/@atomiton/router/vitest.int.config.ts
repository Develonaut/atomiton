import { defineIntegrationTestConfig } from "@atomiton/vite-config";

export default defineIntegrationTestConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["@testing-library/jest-dom"],
  },
});