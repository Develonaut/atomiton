import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "@atomiton/theme",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "esm" : "cjs"}.js`,
    },
    rollupOptions: {
      external: ["@mantine/core"],
      output: {
        exports: "named",
        globals: {
          "@mantine/core": "MantineCore",
        },
      },
    },
  },
});
