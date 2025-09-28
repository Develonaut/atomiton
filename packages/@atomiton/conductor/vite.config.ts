import { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts"],
    }),
  ],
  build: {
    target: "es2020",
    lib: {
      entry: {
        "exports/browser/index": resolve(
          __dirname,
          "src/exports/browser/index.ts",
        ),
        "exports/desktop/index": resolve(
          __dirname,
          "src/exports/desktop/index.ts",
        ),
      },
      name: "AtomitonConductor",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: [
        "@atomiton/nodes",
        "@atomiton/nodes/definitions",
        "@atomiton/nodes/executables",
        "isolated-vm",
        "fs",
        "fs/promises",
        "path",
        "os",
        "child_process",
      ],
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
      plugins: [
        visualizer({
          filename: "dist/stats.html",
          open: false,
          gzipSize: true,
          brotliSize: true,
        }),
      ],
    },
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.debug"],
      },
      mangle: {
        keep_classnames: true,
        keep_fnames: true,
      },
    },
    sourcemap: true,
    reportCompressedSize: true,
  },
  resolve: {
    alias: {
      "#": resolve(__dirname, "./src"),
    },
  },
});
