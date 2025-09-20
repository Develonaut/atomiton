import { defineTestConfig } from "@atomiton/vite-config/vitest";

export default defineTestConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["@testing-library/jest-dom"],
  },
});
