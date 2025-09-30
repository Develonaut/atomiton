import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import path from "path";
import { config } from "dotenv";

// Load .env file from project root
config({ path: path.resolve(__dirname, "../../.env") });

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        external: ["@atomiton/logger/desktop"],
      },
    },
    define: {
      "process.env.ATOMITON_LOG_PATH": JSON.stringify(
        process.env.ATOMITON_LOG_PATH,
      ),
      "process.env.ATOMITON_DESKTOP": JSON.stringify(
        process.env.ATOMITON_DESKTOP,
      ),
      "process.env.DEBUG": JSON.stringify(process.env.DEBUG),
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        output: {
          format: "cjs",
          entryFileNames: "[name].js",
        },
      },
    },
  },
  // No renderer config needed - we load from external URL
});
