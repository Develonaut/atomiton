# @atomiton/storage

> Universal storage abstraction for Blueprints and application data across platforms

## Overview

The storage package provides a unified API for storing and retrieving Blueprints and application data across different platforms and storage providers. Like a universal adapter, it presents the same interface whether you're running on desktop, in a browser, or connecting to cloud storage.

## Key Features

- **Platform Agnostic**: Same API works on desktop, browser, and cloud
- **Storage Flexibility**: File system, IndexedDB, cloud providers, or custom backends
- **Cloud Integration**: Google Drive, OneDrive, Dropbox support
- **Tier-Based**: Different features/limits based on subscription tier
- **Format Support**: JSON and YAML serialization built-in
- **Error Handling**: Comprehensive error types with context

## MVP Approach

### Why Storage Abstraction

Starting with a storage abstraction layer ensures:

1. **Future Proof**: Easy to add new storage backends without changing app code
2. **Platform Ready**: Same code works in desktop app and future browser version
3. **Cloud Ready**: Built-in support for cloud storage providers
4. **Testing**: Mock storage for reliable testing
5. **Scalability**: Can optimize storage per platform/tier

### Supported Storage Types

```typescript
// Auto-detection based on environment
const storage = await createStorage({ platform: "auto" });

// Or specify explicitly
const storage = await createStorage({
  type: "filesystem", // Desktop file system
  type: "indexeddb", // Browser storage
  type: "google-drive", // Google Drive API
  type: "onedrive", // Microsoft OneDrive
  type: "dropbox", // Dropbox API
  type: "cloud", // Atomiton cloud backend
});
```

## Architecture

### Universal API

```typescript
interface IStorageEngine {
  save(key: string, data: any, options?: StorageOptions): Promise<void>;
  load(key: string): Promise<any>;
  list(prefix?: string): Promise<StorageItem[]>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  getInfo(): StorageInfo;
}
```

### Platform Routing

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐
│     App      │────▶│ Storage Package │────▶│ Platform Engine  │
│  (Any Tier)  │     │  (Auto-Route)   │     │ (File/Cloud/DB)  │
└──────────────┘     └─────────────────┘     └──────────────────┘
```

### Storage Engines

- **FilesystemStorage**: Desktop local file system (`~/Atomiton/`)
- **IndexedDBStorage**: Browser persistent storage
- **GoogleDriveStorage**: Google Drive API integration
- **OneDriveStorage**: Microsoft OneDrive API integration
- **DropboxStorage**: Dropbox API integration
- **CloudStorage**: Atomiton managed cloud backend
- **MemoryStorage**: In-memory for testing

## Usage Examples

### Basic Usage

```typescript
import { createStorage } from "@atomiton/storage";

// Auto-detect best storage for platform
const storage = await createStorage({ platform: "auto" });

// Save a Blueprint
await storage.save("blueprints/my-workflow", blueprint, {
  format: "yaml",
  metadata: { author: "user@example.com" },
});

// Load Blueprint
const blueprint = await storage.load("blueprints/my-workflow");

// List all Blueprints
const items = await storage.list("blueprints/");
```

### Cloud Storage

```typescript
// Connect to Google Drive
const storage = await createStorage({
  type: "google-drive",
  options: {
    credentials: googleCredentials,
    folder: "Atomiton Blueprints",
  },
});

// Same API works with any storage type
await storage.save("blueprints/workflow", blueprint);
```

## Status

🚧 **Package Structure Created** - Interfaces defined, implementations pending.

See [ROADMAP.md](./ROADMAP.md) for detailed development timeline.

## Documentation

- [Storage Engines](./docs/STORAGE_ENGINES.md) - Platform-specific implementations
- [Cloud Integration](./docs/CLOUD_INTEGRATION.md) - Cloud storage provider setup
- [Migration Strategy](./docs/MIGRATION_STRATEGY.md) - Moving between storage types
- [Testing Guide](./docs/TESTING_GUIDE.md) - Mock storage and testing patterns

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Run tests
pnpm test

# Watch mode
pnpm dev
```

## License

MIT
