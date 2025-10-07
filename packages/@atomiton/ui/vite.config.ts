import { defineReactLibraryConfig } from "@atomiton/vite-config";
import { resolve } from "path";

export default defineReactLibraryConfig({
  name: "AtomitonUI",
  enableTailwind: true,
  enableTsconfigPaths: false, // Disable tsconfig-paths, use explicit alias instead
  external: ["react-router-dom"],
  chunks: {
    components: ["src/components/"],
    theme: ["src/theme/"],
    utils: ["src/utils/"],
  },
  additionalConfig: {
    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
      alias: {
        "#primitives": resolve(__dirname, "src/primitives"),
        "#components": resolve(__dirname, "src/components"),
        "#system": resolve(__dirname, "src/system"),
        "#theme": resolve(__dirname, "src/theme"),
        "#utils": resolve(__dirname, "src/utils"),
        "#types": resolve(__dirname, "src/types"),
        "#hooks": resolve(__dirname, "src/hooks"),
      },
    },
    build: {
      rollupOptions: {
        // Explicitly set Rollup's module resolution options
        preserveSymlinks: false,
        treeshake: {
          moduleSideEffects: false,
        },
      },
    },
    server: {
      port: parseInt(process.env.VITE_UI_PORT || "5174"),
      strictPort: true,
      host: true,
      fs: {
        allow: [".."],
      },
    },
    optimizeDeps: {
      include: ["react", "react-dom", "react-router-dom"],
    },
  },
});
