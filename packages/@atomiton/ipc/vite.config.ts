import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: {
        "main/index": resolve(__dirname, "src/main/index.ts"),
        "preload/index": resolve(__dirname, "src/preload/index.ts"),
        "renderer/index": resolve(__dirname, "src/renderer/index.ts"),
        "shared/index": resolve(__dirname, "src/shared/index.ts"),
      },
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["electron", "path", "fs", "crypto"],
    },
  },
});
