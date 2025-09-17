/// <reference types="vitest" />
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      "@atomiton/router": path.resolve(
        __dirname,
        "../../packages/@atomiton/router/src",
      ),
      "@atomiton/store": path.resolve(
        __dirname,
        "../../packages/@atomiton/store/src",
      ),
      "@atomiton/editor": path.resolve(
        __dirname,
        "../../packages/@atomiton/editor/src",
      ),
      "@atomiton/ui": path.resolve(
        __dirname,
        "../../packages/@atomiton/ui/src",
      ),
      "@atomiton/form": path.resolve(
        __dirname,
        "../../packages/@atomiton/form/src",
      ),
      "@atomiton/nodes/browser": path.resolve(
        __dirname,
        "../../packages/@atomiton/nodes/src/exports/browser",
      ),
      "@atomiton/nodes/executable": path.resolve(
        __dirname,
        "../../packages/@atomiton/nodes/src/exports/executable",
      ),
      "@atomiton/nodes": path.resolve(
        __dirname,
        "../../packages/@atomiton/nodes/src",
      ),
      "@atomiton/utils": path.resolve(
        __dirname,
        "../../packages/@atomiton/utils/src",
      ),
      "@atomiton/hooks": path.resolve(
        __dirname,
        "../../packages/@atomiton/hooks/src",
      ),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["src/**/*.e2e.spec.ts", "src/__tests__/e2e/**"],
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
