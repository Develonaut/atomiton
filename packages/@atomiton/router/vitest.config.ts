import { defineTestConfig } from "@atomiton/vite-config";

export default defineTestConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["@testing-library/jest-dom"],
  },
});
