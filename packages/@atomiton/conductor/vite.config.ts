import { defineLibraryConfig } from "@atomiton/vite-config";

export default defineLibraryConfig({
  name: "AtomitonConductor",
  entry: "./src/index.ts",
  external: [
    // External packages
    "@atomiton/events",
    "@atomiton/nodes",
    "@atomiton/storage",
    "@atomiton/store",
    "@atomiton/utils",
    "p-queue",
    "uuid",
    "electron",
    // Node.js built-ins
    "fs",
    "fs/promises",
    "path",
    "crypto",
    "util",
    "os",
    "events",
    "stream",
    "worker_threads",
    /^node:/,
  ],
  chunks: {
    vendor: ["node_modules"],
    "engine-enhanced": ["src/engine/enhanced/"],
    engine: ["src/engine/"],
    "execution-composite": ["src/execution/composite/"],
    execution: ["src/execution/"],
    "queue-core": ["src/queue/core/"],
    queue: ["src/queue/"],
    store: ["src/store/"],
    transport: ["src/transport/"],
    electron: ["src/electron/"],
    runtime: ["src/runtime/"],
    simple: ["src/simple/"],
    interfaces: ["src/interfaces/"],
  },
  enableVisualizer: true,
  enableMinification: true,
  enableSourceMap: true,
  testEnvironment: "node",
  additionalConfig: {
    build: {
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ["console.log", "console.debug"],
        },
        mangle: {
          keep_classnames: true,
          keep_fnames: true,
        },
      },
    },
  },
});
