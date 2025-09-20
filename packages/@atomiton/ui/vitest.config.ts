import { defineTestConfig } from "@atomiton/vite-config/vitest";
import path from "path";

export default defineTestConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    exclude: [
      "**/baseline-screenshots.spec.ts",
      "**/screenshots.spec.ts",
      "**/capture-reference.spec.ts",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
