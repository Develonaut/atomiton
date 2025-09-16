import { visualizer } from "rollup-plugin-visualizer";
import type { Plugin } from "vite";

export function createVisualizerPlugin(
  filename = "dist/stats.html",
  open = false,
): Plugin {
  return visualizer({
    filename,
    open,
    gzipSize: true,
    brotliSize: true,
  }) as Plugin;
}
