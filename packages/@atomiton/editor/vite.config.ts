import { defineReactLibraryConfig } from "@atomiton/vite-config";

export default defineReactLibraryConfig({
  name: "AtomitonEditor",
  entry: "./src/index.ts",
  external: [
    "@atomiton/hooks",
    "@atomiton/nodes",
    "@atomiton/store",
    "@atomiton/ui",
    "@xyflow/react",
  ],
  chunks: {
    xyflow: ["@xyflow/react"],
    components: ["src/components/"],
    nodes: ["src/nodes/"],
    utils: ["src/hooks/", "src/lib/"],
  },
  enableVisualizer: true,
  enableMinification: true,
  enableSourceMap: true,
  testEnvironment: "jsdom",
  additionalConfig: {
    logLevel: process.env.NODE_ENV === "production" ? "info" : "warn",
    server: {
      port: parseInt(process.env.VITE_EDITOR_PORT || "5175"),
      strictPort: true,
      host: true,
    },
    test: {
      globals: true,
      setupFiles: ["./src/test-setup.ts"],
      exclude: ["**/tests/**", "**/node_modules/**", "**/*.spec.ts"],
    },
  },
});
