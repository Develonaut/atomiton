import { defineConfig } from "electron-vite";
import { resolve } from "path";

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "src/main.ts"),
        },
        external: ["electron"],
      },
    },
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          preload: resolve(__dirname, "src/preload.ts"),
        },
        external: ["electron"],
      },
    },
  },
  renderer: {
    root: resolve(__dirname, "../client"),
    build: {
      outDir: resolve(__dirname, "dist/renderer"),
    },
  },
});
