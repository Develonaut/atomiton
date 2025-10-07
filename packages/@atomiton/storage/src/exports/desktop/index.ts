/**
 * Desktop-specific storage exports
 * Includes all storage engines including filesystem and path management
 */

import type { IStorageEngine } from "#types";
import { createFileSystemEngine } from "#index";

// Export essential storage types
export type {
  IStorageEngine,
  StorageOptions,
  StorageItem,
  StorageInfo,
  StorageType,
  Platform,
  StorageError,
  StorageErrorCode,
} from "#types";

export {
  createFileSystemEngine,
  createMemoryEngine,
  type FileSystemStorageConfig,
  type InMemoryStorageConfig,
} from "#index";

// Export path management (desktop-only)
export { createPathManager } from "#paths";
export type {
  PathManager,
  PathManagerConfig,
  PathContext,
  PathMap,
  ElectronPathName,
} from "#paths";

/**
 * Creates a storage instance for desktop environments
 * @param config.engine - Optional storage engine. Defaults to filesystem storage in user home
 */
export function createStorage(
  config: { engine?: IStorageEngine } = {},
): IStorageEngine {
  if (config.engine) {
    return config.engine;
  }

  // Default to filesystem storage in user's home directory
  const defaultPath =
    process.platform === "win32"
      ? process.env.APPDATA || process.env.HOME || "."
      : process.env.HOME || ".";

  return createFileSystemEngine({
    baseDir: `${defaultPath}/.atomiton`,
  });
}
