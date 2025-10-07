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
      alias: [
        {
          find: /^#primitives\/(.*)$/,
          replacement: resolve(__dirname, "src/primitives/$1.tsx"),
        },
        {
          find: "#primitives",
          replacement: resolve(__dirname, "src/primitives"),
        },
        {
          find: /^#components\/(.*)$/,
          replacement: resolve(__dirname, "src/components/$1"),
        },
        {
          find: "#components",
          replacement: resolve(__dirname, "src/components"),
        },
        {
          find: /^#system\/(.*)$/,
          replacement: resolve(__dirname, "src/system/$1"),
        },
        { find: "#system", replacement: resolve(__dirname, "src/system") },
        {
          find: /^#theme\/(.*)$/,
          replacement: resolve(__dirname, "src/theme/$1"),
        },
        { find: "#theme", replacement: resolve(__dirname, "src/theme") },
        {
          find: /^#utils\/(.*)$/,
          replacement: resolve(__dirname, "src/utils/$1"),
        },
        { find: "#utils", replacement: resolve(__dirname, "src/utils") },
        {
          find: /^#types\/(.*)$/,
          replacement: resolve(__dirname, "src/types/$1"),
        },
        { find: "#types", replacement: resolve(__dirname, "src/types") },
        {
          find: /^#hooks\/(.*)$/,
          replacement: resolve(__dirname, "src/hooks/$1"),
        },
        { find: "#hooks", replacement: resolve(__dirname, "src/hooks") },
      ],
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
