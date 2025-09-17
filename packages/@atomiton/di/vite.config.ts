import { defineLibraryConfig } from "@atomiton/vite-config";

export default defineLibraryConfig({
  name: "AtomitonDI",
  entry: "./src/index.ts",
  external: ["reflect-metadata", "tsyringe"],
  formats: ["es", "cjs"],
  chunks: {
    vendor: ["node_modules"],
    decorators: ["src/decorators/"],
    container: ["src/container/"],
    utils: ["src/utils/"],
  },
  enableVisualizer: true,
  enableMinification: true,
  enableSourceMap: true,
  additionalConfig: {
    build: {
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
    },
  },
});
