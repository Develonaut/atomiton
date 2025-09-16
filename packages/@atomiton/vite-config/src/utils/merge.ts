import type { UserConfig, AliasOptions } from "vite";

export function mergeViteConfig(
  base: UserConfig,
  additional: UserConfig,
): UserConfig {
  return {
    ...base,
    ...additional,
    plugins: [
      ...(Array.isArray(base.plugins) ? base.plugins : []),
      ...(Array.isArray(additional.plugins) ? additional.plugins : []),
    ],
    build: {
      ...base.build,
      ...additional.build,
      rollupOptions: {
        ...base.build?.rollupOptions,
        ...additional.build?.rollupOptions,
        external: mergeExternal(
          base.build?.rollupOptions?.external,
          additional.build?.rollupOptions?.external,
        ),
        output: {
          ...base.build?.rollupOptions?.output,
          ...additional.build?.rollupOptions?.output,
        },
      },
    },
    server: {
      ...base.server,
      ...additional.server,
    },
    optimizeDeps: {
      ...base.optimizeDeps,
      ...additional.optimizeDeps,
      exclude: mergeArrays(
        base.optimizeDeps?.exclude,
        additional.optimizeDeps?.exclude,
      ),
    },
    resolve: {
      ...base.resolve,
      ...additional.resolve,
      alias: {
        ...getAlias(base.resolve?.alias),
        ...getAlias(additional.resolve?.alias),
      },
    },
    test: {
      ...base.test,
      ...additional.test,
    },
  };
}

function mergeArrays<T>(
  arr1: T | T[] | undefined,
  arr2: T | T[] | undefined,
): T[] {
  const result: T[] = [];
  if (Array.isArray(arr1)) result.push(...arr1);
  if (Array.isArray(arr2)) result.push(...arr2);
  return result;
}

function getAlias(alias: AliasOptions | undefined): Record<string, string> {
  if (!alias) return {};
  if (Array.isArray(alias)) {
    return alias.reduce(
      (acc, { find, replacement }) => ({
        ...acc,
        [find.toString()]: replacement,
      }),
      {},
    );
  }
  return alias as Record<string, string>;
}

function mergeExternal(
  ext1: unknown,
  ext2: unknown,
): (string | RegExp)[] | undefined {
  const result: (string | RegExp)[] = [];

  if (Array.isArray(ext1)) {
    result.push(
      ...ext1.filter(
        (item) => typeof item === "string" || item instanceof RegExp,
      ),
    );
  }
  if (Array.isArray(ext2)) {
    result.push(
      ...ext2.filter(
        (item) => typeof item === "string" || item instanceof RegExp,
      ),
    );
  }

  return result.length > 0 ? result : undefined;
}
