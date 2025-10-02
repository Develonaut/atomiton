import { defineAppConfig } from "@atomiton/vite-config";
import path from "path";

export default defineAppConfig({
  port: parseInt(process.env.VITE_CLIENT_PORT || "5173"),
  workspacePackages: [
    "@atomiton/ui",
    "@atomiton/editor",
    "@atomiton/form",
    "@atomiton/store",
    "@atomiton/rpc",
    "@atomiton/conductor",
  ],
  enableTailwind: true,
  assetsInlineLimit: 4096,
  chunkSizeWarningLimit: 500,
  additionalConfig: {
    define: {
      "import.meta.env.VITE_REPO_ROOT": JSON.stringify(
        path.resolve(__dirname, "../.."),
      ),
    },
    resolve: {
      conditions:
        process.env.NODE_ENV === "development"
          ? ["development", "import", "module", "browser", "default"]
          : undefined,
    },
  },
});
