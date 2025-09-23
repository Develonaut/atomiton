import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  resolve: {
    alias: {
      "#": resolve(__dirname, "./src"),
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts"],
      compilerOptions: {
        rootDir: "src",
      },
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        base: resolve(__dirname, "src/base.ts"),
        "react-internal": resolve(__dirname, "src/react-internal.ts"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        "@eslint/js",
        "eslint-config-prettier",
        "eslint-plugin-react",
        "eslint-plugin-react-hooks",
        "eslint-plugin-turbo",
        "globals",
        "typescript-eslint",
      ],
    },
    minify: false,
  },
});