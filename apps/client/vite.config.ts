import { defineAppConfig } from "@atomiton/vite-config";

export default defineAppConfig({
  port: parseInt(process.env.VITE_CLIENT_PORT || "5173"),
  workspacePackages: [
    "@atomiton/ui",
    "@atomiton/editor",
    "@atomiton/form",
    "@atomiton/store",
  ],
  enableTailwind: true,
  assetsInlineLimit: 4096,
  chunkSizeWarningLimit: 500,
  additionalConfig: {
    resolve: {
      conditions:
        process.env.NODE_ENV === "development"
          ? ["development", "import", "module", "browser", "default"]
          : undefined,
    },
  },
});
