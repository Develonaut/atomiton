export { defineLibraryConfig } from "#presets/library";
export { defineReactLibraryConfig } from "#presets/react";
export { defineAppConfig } from "#presets/app";
export {
  defineVitestConfig,
  defineTestConfig,
  defineIntegrationTestConfig,
  defineBenchmarkTestConfig,
  defineUnitTestConfig,
  defineSmokeTestConfig,
} from "#presets/vitest";

export { getTerserOptions } from "#utils/terser";
export { createManualChunks } from "#utils/chunks";
export {
  getAssetFileName,
  DEFAULT_ASSETS_INCLUDE,
  DEFAULT_INLINE_LIMIT,
} from "#utils/assets";
export {
  getOptimizeDepsConfig,
  getResolveConditions,
  type OptimizeDepsConfig,
} from "#utils/optimizeDeps";

export type {
  LibraryOptions,
  ReactLibraryOptions,
  AppOptions,
  ChunkMapping,
  TerserConfig,
} from "#types";
