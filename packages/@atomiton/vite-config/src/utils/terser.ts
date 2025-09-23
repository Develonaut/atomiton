import type { TerserConfig } from "#types";

export function getTerserOptions(config: TerserConfig = {}) {
  const {
    dropConsole = true,
    dropDebugger = true,
    keepClassNames = true,
    keepFunctionNames = true,
    pureFunctions = ["console.log", "console.debug"],
  } = config;

  return {
    compress: {
      drop_console: dropConsole,
      drop_debugger: dropDebugger,
      pure_funcs: pureFunctions,
    },
    mangle: {
      keep_classnames: keepClassNames,
      keep_fnames: keepFunctionNames,
    },
  };
}
