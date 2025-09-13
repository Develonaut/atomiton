/**
 * @atomiton/storage
 *
 * Universal storage abstraction for Composites and application data across platforms
 */

// Storage engine exports
export { FileSystemStorage } from "./engines/FileSystemStorage";

// Core interfaces
export type IStorageEngine = {
  save(key: string, data: unknown, options?: StorageOptions): Promise<void>;
  load(key: string): Promise<unknown>;
  list(prefix?: string): Promise<StorageItem[]>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  getInfo(): StorageInfo;
};

export type StorageOptions = {
  format?: "json" | "yaml";
  metadata?: Record<string, unknown>;
  encryption?: boolean;
};

export type StorageItem = {
  key: string;
  name: string;
  size: number;
  created: string;
  updated: string;
  metadata?: Record<string, unknown>;
};

export type StorageInfo = {
  type: StorageType;
  platform: Platform;
  connected: boolean;
  limits?: {
    maxFileSize?: number;
    maxFiles?: number;
    quotaUsed?: number;
    quotaTotal?: number;
  };
};

export type StorageType =
  | "filesystem" // Local file system (desktop)
  | "indexeddb" // Browser IndexedDB
  | "google-drive" // Google Drive API
  | "onedrive" // Microsoft OneDrive API
  | "dropbox" // Dropbox API
  | "cloud" // Atomiton cloud backend
  | "memory" // In-memory (testing)
  | "mock"; // Mock implementation (testing)

export type Platform = "desktop" | "browser" | "cloud" | "mobile";

export type StorageTier = "free" | "pro" | "enterprise";

// Factory function for creating storage engines
export type StorageConfig = {
  type?: StorageType;
  platform?: Platform;
  tier?: StorageTier;
  options?: Record<string, unknown>;
};

// TODO: Implement storage engine factory
// export function createStorage(config: StorageConfig): Promise<IStorageEngine>;

// TODO: Implement additional storage engines
// export { IndexedDBStorage } from './engines/IndexedDBStorage.js';
// export { GoogleDriveStorage } from './engines/GoogleDriveStorage.js';
// export { OneDriveStorage } from './engines/OneDriveStorage.js';
// export { DropboxStorage } from './engines/DropboxStorage.js';
// export { CloudStorage } from './engines/CloudStorage.js';

// Error types
export class StorageError extends Error {
  constructor(
    message: string,
    public readonly code: StorageErrorCode,
    public readonly cause?: Error,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "StorageError";

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StorageError);
    }
  }
}

export type StorageErrorCode =
  | "NOT_FOUND"
  | "ACCESS_DENIED"
  | "QUOTA_EXCEEDED"
  | "NETWORK_ERROR"
  | "SERIALIZATION_ERROR"
  | "AUTHENTICATION_FAILED"
  | "UNSUPPORTED_OPERATION"
  | "STORAGE_FULL";
