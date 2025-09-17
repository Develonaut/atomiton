import { defineReactLibraryConfig } from "@atomiton/vite-config";

export default defineReactLibraryConfig({
  name: "AtomitonUI",
  enableTailwind: true,
  enableTsconfigPaths: true,
  external: [],
  chunks: {
    components: ["src/components/"],
    theme: ["src/theme/"],
    utils: ["src/utils/"],
  },
  additionalConfig: {
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
