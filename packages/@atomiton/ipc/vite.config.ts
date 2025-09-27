import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      outDir: "dist",
      entryRoot: "src",
    }),
  ],
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
      external: [
        "electron",
        "path",
        "fs",
        "crypto",
        "@atomiton/nodes/executables",
        "fs/promises",
        "os",
        "child_process",
        "isolated-vm",
      ],
    },
  },
  resolve: {
    alias: {
      "#": resolve(__dirname, "src"),
    },
  },
});
