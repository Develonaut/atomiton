import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      outDir: "dist",
      entryRoot: "src",
    }),
  ],
  build: {
    lib: {
      entry: {
        "main/index": resolve(__dirname, "src/main/index.ts"),
        "main/channels/index": resolve(__dirname, "src/main/channels/index.ts"),
        "preload/index": resolve(__dirname, "src/preload/index.ts"),
        "renderer/index": resolve(__dirname, "src/renderer/index.ts"),
        "shared/index": resolve(__dirname, "src/shared/index.ts"),
        "schemas/node": resolve(__dirname, "src/schemas/node.ts"),
      },
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: [
        // Electron
        "electron",

        // Node built-ins
        "path",
        "fs",
        "fs/promises",
        "crypto",
        "os",
        "child_process",
        "util",
        "stream",
        "events",
        "http",
        "https",
        "zlib",
        "buffer",
        "string_decoder",
        "url",
        "assert",
        "net",
        "tls",
        "dns",
        "dgram",
        "process",

        // Dependencies - must externalize these!
        "winston",
        "winston-transport",
        "logform",
        "@colors/colors",
        "triple-beam",
        "readable-stream",
        "async",
        "is-stream",
        "one-time",
        "stack-trace",
        "fecha",
        "ms",
        "safe-stable-stringify",
        "p-retry",
        "retry",
        "isolated-vm",
        "@atomiton/nodes/executables",
        "@atomiton/conductor",
        "@atomiton/conductor/types",
        "@atomiton/nodes",
        "@atomiton/validation",
      ],
    },
  },
  resolve: {
    alias: {
      "#": resolve(__dirname, "src"),
    },
  },
});
