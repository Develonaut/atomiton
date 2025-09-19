/**
 * @atomiton/storage
 *
 * Universal storage abstraction for Composites and application data across platforms
 */

export * from "./types";
export {
  createFileSystemStorage,
  type FileSystemStorageConfig,
} from "./factories/createFileSystemStorage";
export {
  createInMemoryStorage,
  type InMemoryStorageConfig,
} from "./factories/createInMemoryStorage";
import { type IStorageEngine, type StorageConfig } from "./types";
import { createFileSystemStorage } from "./factories/createFileSystemStorage";
import { createInMemoryStorage } from "./factories/createInMemoryStorage";

export function createStorage(config: StorageConfig): IStorageEngine {
  switch (config.type) {
    case "memory":
      return createInMemoryStorage();
    case "filesystem":
      return createFileSystemStorage();
    default:
      throw new Error(`Unknown storage type: ${config.type}`);
  }
}

// Future storage factory functions
// export { createIndexedDBStorage } from './factories/createIndexedDBStorage';
// export { createGoogleDriveStorage } from './factories/createGoogleDriveStorage';
// export { createOneDriveStorage } from './factories/createOneDriveStorage';
// export { createDropboxStorage } from './factories/createDropboxStorage';
// export { createCloudStorage } from './factories/createCloudStorage';
