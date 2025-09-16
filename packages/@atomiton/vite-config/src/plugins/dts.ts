import dts from "vite-plugin-dts";
import type { PluginOption } from "vite";

export function createDtsPlugin(
  include: string[] = ["src/**/*.ts", "src/**/*.tsx"],
  exclude: string[] = [
    "src/**/*.test.ts",
    "src/**/*.test.tsx",
    "src/**/*.smoke.test.ts",
    "src/**/*.bench.ts",
  ],
): PluginOption {
  return dts({
    insertTypesEntry: true,
    include,
    exclude,
  });
}
