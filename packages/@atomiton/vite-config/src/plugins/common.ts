import type { PluginOption } from "vite";
import { createDtsPlugin } from "./dts";
import { createVisualizerPlugin } from "./visualizer";

export type CommonPluginsOptions = {
  enableDts?: boolean;
  enableVisualizer?: boolean;
  dtsInclude?: string[];
  dtsExclude?: string[];
  visualizerFilename?: string;
};

export function getCommonPlugins(
  options: CommonPluginsOptions = {},
): PluginOption[] {
  const {
    enableDts = true,
    enableVisualizer = true,
    dtsInclude,
    dtsExclude,
    visualizerFilename,
  } = options;

  const plugins: PluginOption[] = [];

  if (enableDts) {
    plugins.push(createDtsPlugin(dtsInclude, dtsExclude));
  }

  if (enableVisualizer) {
    plugins.push(createVisualizerPlugin(visualizerFilename));
  }

  return plugins;
}
