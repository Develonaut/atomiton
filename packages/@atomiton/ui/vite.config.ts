import { defineReactLibraryConfig } from "@atomiton/vite-config";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineReactLibraryConfig({
  name: "AtomitonUI",
  enableTailwind: true,
  enableTsconfigPaths: true,
  external: ["react-router-dom"],
  chunks: {
    components: ["src/components/"],
    theme: ["src/theme/"],
    utils: ["src/utils/"],
  },
  additionalConfig: {
    resolve: {
      alias: [{ find: /^#(.*)$/, replacement: resolve(__dirname, "src/$1") }],
      extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
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
