/**
 * Browser-specific storage exports
 * Only includes engines that work in browser environments
 */

import type { IStorageEngine } from "#types";
import { createMemoryEngine } from "#index";

export * from "#types";
export { createMemoryEngine, type InMemoryStorageConfig } from "#index";

/**
 * Creates a storage instance for browser environments
 * @param config.engine - Optional storage engine. Defaults to memory storage with persistence warning
 */
export function createStorage(
  config: { engine?: IStorageEngine } = {},
): IStorageEngine {
  if (config.engine) {
    return config.engine;
  }

  // Default to memory with warning (until IndexedDB implemented)
  console.warn(
    "Browser storage: Using in-memory storage (data will not persist). " +
      "IndexedDB support coming soon. To suppress this warning, explicitly pass createMemoryEngine() as the engine.",
  );
  return createMemoryEngine();
}
