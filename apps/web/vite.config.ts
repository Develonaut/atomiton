import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    port: 3001, // Use different port to avoid conflicts with Next.js
    host: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  // Define global constants for compatibility
  define: {
    global: "globalThis",
    // TODO: Remove this once Nextjs migration is complete.
    "process.env": {},
    "process.env.__NEXT_ROUTER_BASEPATH": JSON.stringify(""),
  },
  // Temporarily disable CSS processing for Phase 1
  // css: {
  //   postcss: false,
  // },
});
