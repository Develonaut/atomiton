/**
 * @atomiton/storage
 *
 * Base exports - mainly for re-export by browser/desktop modules
 * Direct usage of this module is discouraged in favor of environment-specific exports
 */

export * from "./types";

// Re-export factories with explicit engine naming
export {
  createFileSystemStorage as createFileSystemEngine,
  type FileSystemStorageConfig,
} from "./factories/createFileSystemStorage";

export {
  createInMemoryStorage as createMemoryEngine,
  type InMemoryStorageConfig,
} from "./factories/createInMemoryStorage";

// Future storage engines
// export { createIndexedDBStorage as createIndexedDBEngine } from './factories/createIndexedDBStorage';
// export { createLocalStorage as createLocalStorageEngine } from './factories/createLocalStorage';
