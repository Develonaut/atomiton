/**
 * Prop resolver system for transforming legacy or alternative prop names
 * to standardized prop names
 */

export type PropResolver<T = Record<string, unknown>> = (props: T) => T;

/**
 * Creates a prop resolver that transforms props based on a configuration
 */
export function createPropResolver<T extends Record<string, unknown>>(config: {
  aliases?: Record<string, string>;
  transformers?: Record<string, (value: unknown, props: T) => unknown>;
  conditionals?: Array<{
    if: (props: T) => boolean;
    then: (props: T) => Partial<T>;
  }>;
}): PropResolver<T> {
  return (props: T): T => {
    let resolved = { ...props };

    // Apply aliases (simple prop renames)
    if (config.aliases) {
      for (const [from, to] of Object.entries(config.aliases)) {
        if (from in resolved && !(to in resolved)) {
          resolved[to as keyof T] = resolved[from as keyof T];
          delete resolved[from as keyof T];
        }
      }
    }

    // Apply transformers (value transformations)
    if (config.transformers) {
      for (const [key, transformer] of Object.entries(config.transformers)) {
        if (key in resolved) {
          resolved[key as keyof T] = transformer(
            resolved[key as keyof T],
            resolved,
          ) as T[keyof T];
        }
      }
    }

    // Apply conditionals (complex logic)
    if (config.conditionals) {
      for (const conditional of config.conditionals) {
        if (conditional.if(resolved)) {
          const updates = conditional.then(resolved);
          resolved = { ...resolved, ...updates };
        }
      }
    }

    return resolved;
  };
}
