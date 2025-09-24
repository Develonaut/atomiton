import type { PropResolver } from "#system/utils/createPropResolver";

/**
 * Compose multiple prop resolvers into a single resolver
 */
export function composePropResolvers<T extends Record<string, unknown>>(
  ...resolvers: PropResolver<T>[]
): PropResolver<T> {
  return (props: T): T => {
    let resolved = props;
    for (const resolver of resolvers) {
      resolved = resolver(resolved);
    }
    return resolved;
  };
}
