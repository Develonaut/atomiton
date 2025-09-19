import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.test.ts",
        "src/**/*.smoke.test.ts",
        "src/**/*.bench.ts",
      ],
    }),
    visualizer({
      filename: "dist/stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    target: "es2020",
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        browser: resolve(__dirname, "src/browser.ts"),
        desktop: resolve(__dirname, "src/desktop.ts"),
      },
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: [
        "@atomiton/nodes",
        "fs",
        "fs/promises",
        "path",
        "crypto",
        "util",
        "os",
        "events",
        /^node:/,
      ],
      output: {
        // Custom fileName to handle multiple entries
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "index") {
            return chunkInfo.format === "es" ? "index.js" : "index.cjs";
          }
          return `${chunkInfo.name}.js`;
        },
      },
    },
    sourcemap: true,
    reportCompressedSize: true,
  },
});
