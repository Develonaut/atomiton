/**
 * @atomiton/storage
 *
 * Universal storage abstraction for Composites and application data across platforms
 */

// Re-export all types
export * from "./types";

// Storage engine exports
export { FileSystemStorage } from "./engines/FileSystemStorage";

// TODO: Implement storage engine factory
// export function createStorage(config: StorageConfig): Promise<IStorageEngine>;

// TODO: Implement additional storage engines
// export { IndexedDBStorage } from './engines/IndexedDBStorage.js';
// export { GoogleDriveStorage } from './engines/GoogleDriveStorage.js';
// export { OneDriveStorage } from './engines/OneDriveStorage.js';
// export { DropboxStorage } from './engines/DropboxStorage.js';
// export { CloudStorage } from './engines/CloudStorage.js';
