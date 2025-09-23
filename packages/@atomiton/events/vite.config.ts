import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig(({ mode }) => {
  // Determine build target
  const target = mode === "desktop" ? "desktop" : "browser";

  // Base configuration
  const config = {
    plugins: [
      dts({
        insertTypesEntry: true,
        include: ["src/**/*.ts"],
        exclude: [
          "src/**/*.test.ts",
          "src/**/*.bench.ts",
          "src/**/*.spec.ts",
          // Exclude the opposite target's files
          target === "browser" ? "src/desktop/**" : "src/browser/**",
        ],
        // Prevent cleaning existing output
        cleanVueFileName: false,
        copyDtsFiles: false,
        strictOutput: false,
        // Only output type definitions for the current target
        beforeWriteFile: (filePath, content) => {
          // Keep files that match the current target
          if (filePath.includes(`/${target}/`)) {
            return { filePath, content };
          }
          // Keep shared files (core, shared)
          if (
            !filePath.includes("/browser/") &&
            !filePath.includes("/desktop/")
          ) {
            return { filePath, content };
          }
          // Skip files from the opposite target
          return false;
        },
      }),
    ],
    resolve: {
      alias: {
        "#core": resolve(__dirname, "src/core"),
        "#browser": resolve(__dirname, "src/browser"),
        "#desktop": resolve(__dirname, "src/desktop"),
        "#shared": resolve(__dirname, "src/shared"),
      },
    },
    build: {
      target: "es2020",
      minify: "terser",
      terserOptions: {
        format: {
          comments: false,
        },
        compress: {
          drop_console: false,
          drop_debugger: true,
        },
      },
      sourcemap: true,
      reportCompressedSize: true,
      outDir: "dist",
      // Don't empty the output directory to preserve other build outputs
      emptyOutDir: false,
      lib: {
        entry: resolve(__dirname, `src/${target}/index.ts`),
        name:
          target === "browser"
            ? "AtomitonEventsBrowser"
            : "AtomitonEventsDesktop",
        formats: ["es", "cjs"],
        fileName: (format) =>
          `${target}/index.${format === "es" ? "js" : "cjs"}`,
      },
      rollupOptions: {
        external:
          target === "browser"
            ? ["eventemitter3"]
            : [
                "node:events",
                "events",
                "util",
                "electron",
                "fs",
                "path",
                "process",
              ],
        output: {
          globals:
            target === "browser" ? { eventemitter3: "EventEmitter3" } : {},
        },
      },
    },
  };

  return config;
});
