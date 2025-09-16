export { defineLibraryConfig } from "./presets/library";
export { defineReactLibraryConfig } from "./presets/react";
export { defineAppConfig } from "./presets/app";

export { createDtsPlugin } from "./plugins/dts";
export { createVisualizerPlugin } from "./plugins/visualizer";
export { getCommonPlugins } from "./plugins/common";

export { getTerserOptions } from "./utils/terser";
export { createManualChunks } from "./utils/chunks";

export type {
  LibraryOptions,
  ReactLibraryOptions,
  AppOptions,
  ChunkMapping,
  TerserConfig,
} from "./types";
