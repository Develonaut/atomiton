# @atomiton/storage

Universal storage abstraction for Composites and application data across
platforms. Features split exports for optimized bundle sizes and
platform-specific capabilities.

## 📊 Current Status

✅ **Phase 0 Complete** - Functional programming pattern with split exports

**Implemented Features:**

- Split exports pattern for browser/desktop bundle optimization
- Factory functions: `createStorage()`, `createFileSystem()`, `createMemory()`
- Type-safe storage operations with comprehensive TypeScript support
- Memory storage for testing and browser fallback
- Filesystem storage for desktop environments
- Automatic platform detection with smart defaults
- Robust error handling with `StorageError` class

## 📦 Split Exports Pattern

The storage package uses split exports to optimize bundle sizes and provide
platform-specific functionality:

### Available Exports

```typescript
// Browser export - optimized for web environments
import { createStorage, createMemory } from "@atomiton/storage/browser";

// Desktop export - includes filesystem support
import {
  createStorage,
  createFileSystem,
  createMemory,
} from "@atomiton/storage/desktop";

// Note: No main export to prevent bloated bundles
```

### Why Split Exports?

- **Bundle Optimization**: Browser builds exclude Node.js filesystem
  dependencies
- **Platform Safety**: Prevents importing incompatible engines
- **Future-Proof**: Easy to add new platform-specific engines
- **Consistent with Ecosystem**: Follows same pattern as `@atomiton/nodes`

## 🚀 Quick Start

### Browser Usage

```typescript
import { createStorage, createMemory } from "@atomiton/storage/browser";

// Automatic storage selection (currently defaults to memory with warning)
const storage = createStorage();

// Explicit memory storage (recommended for browser)
const memoryStorage = createStorage({ engine: createMemory() });

// Direct memory storage creation
const directMemory = createMemory();
```

### Desktop Usage

```typescript
import {
  createStorage,
  createFileSystem,
  createMemory,
} from "@atomiton/storage/desktop";

// Automatic storage selection (defaults to filesystem in user home)
const storage = createStorage();

// Explicit filesystem storage
const fileStorage = createStorage({
  engine: createFileSystem({ baseDir: "./my-data" }),
});

// Direct filesystem storage creation
const directFileSystem = createFileSystem({ baseDir: "~/.atomiton" });

// Memory storage for testing
const testStorage = createMemory();
```

## 🎯 Factory Functions

### `createStorage(config?)`

Smart factory that creates appropriate storage based on context:

```typescript
// Browser context - uses memory with persistence warning
const browserStorage = createStorage();

// Desktop context - uses filesystem in user home directory
const desktopStorage = createStorage();

// Explicit engine selection
const customStorage = createStorage({
  engine: createFileSystem({ baseDir: "./custom" }),
});
```

### `createFileSystem(config?)`

Creates filesystem storage (desktop only):

```typescript
// Default location (~/.atomiton)
const defaultFS = createFileSystem();

// Custom directory
const customFS = createFileSystem({ baseDir: "./data" });

// Full configuration
const configuredFS = createFileSystem({
  baseDir: "/usr/local/atomiton",
  createDirectories: true,
  permissions: 0o755,
});
```

### `createMemory(config?)`

Creates in-memory storage (all platforms):

```typescript
// Basic memory storage
const memory = createMemory();

// With configuration
const configuredMemory = createMemory({
  maxItems: 1000,
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
});
```

## 🔧 Universal Storage Interface

All storage engines implement the same interface:

```typescript
interface IStorageEngine {
  save(key: string, data: unknown, options?: StorageOptions): Promise<void>;
  load(key: string): Promise<unknown>;
  list(prefix?: string): Promise<StorageItem[]>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  getInfo(): StorageInfo;
}
```

### Basic Operations

```typescript
// Save data
await storage.save("flow-123", compositeData);

// Load data
const composite = await storage.load("flow-123");

// Check existence
const exists = await storage.exists("flow-123");

// List items with prefix
const flows = await storage.list("flow-");

// Delete item
await storage.delete("flow-123");

// Get storage information
const info = storage.getInfo(); // { type: "filesystem", platform: "desktop" }
```

### Storage Options

```typescript
await storage.save("key", data, {
  format: "json" | "yaml",
  metadata: { author: "user@example.com", version: "1.0" },
  // Future options: encrypt, compress, expiration
});
```

## 📊 Platform Capabilities

### Desktop (filesystem)

- **Location**: `~/.atomiton` by default
- **Format**: JSON files with `.json` extension
- **Features**: Directory structure, atomic writes, metadata support
- **Performance**: Fast local access, suitable for large datasets

### Browser (memory)

- **Location**: In-memory only (non-persistent)
- **Format**: Native JavaScript objects
- **Features**: Fast access, perfect for testing and temporary data
- **Limitations**: Data lost on page refresh (IndexedDB coming in Phase 1)

## ⚡ Error Handling

Comprehensive error handling with specific error types:

```typescript
import { StorageError, StorageErrorCode } from "@atomiton/storage/desktop";

try {
  await storage.save("key", data);
} catch (error) {
  if (error instanceof StorageError) {
    switch (error.code) {
      case StorageErrorCode.NOT_FOUND:
        console.log("Item not found");
        break;
      case StorageErrorCode.PERMISSION_DENIED:
        console.log("Permission denied");
        break;
      case StorageErrorCode.QUOTA_EXCEEDED:
        console.log("Storage quota exceeded");
        break;
      default:
        console.log("Storage error:", error.message);
    }
  }
}
```

## 🔮 Future Engines (Roadmap)

### Phase 1: Browser Support

- **IndexedDB storage** - Persistent browser storage
- **localStorage fallback** - Simple key-value storage
- **Smart browser detection** - Automatic engine selection

### Phase 2: Cloud Integration

- **Google Drive storage** - Direct cloud storage
- **OneDrive storage** - Microsoft cloud integration
- **Dropbox storage** - Cross-platform sync
- **Atomiton Cloud** - Managed backend service

### Phase 3: Advanced Features

- **Encrypted storage** - Wrapper for any engine with encryption
- **Cached storage** - Performance wrapper with caching
- **Replicated storage** - Multi-backend redundancy

## 📚 API Reference

### Types

```typescript
// Core interfaces
interface IStorageEngine {
  /* ... */
}
interface StorageOptions {
  /* ... */
}
interface StorageItem {
  /* ... */
}
interface StorageInfo {
  /* ... */
}

// Configuration types
interface FileSystemStorageConfig {
  baseDir?: string;
  createDirectories?: boolean;
  permissions?: number;
}

interface InMemoryStorageConfig {
  maxItems?: number;
  maxSizeBytes?: number;
}

// Error handling
class StorageError extends Error {
  code: StorageErrorCode;
  cause?: Error;
  context?: Record<string, unknown>;
}

enum StorageErrorCode {
  NOT_FOUND = "NOT_FOUND",
  PERMISSION_DENIED = "PERMISSION_DENIED",
  QUOTA_EXCEEDED = "QUOTA_EXCEEDED",
  INVALID_KEY = "INVALID_KEY",
  SERIALIZATION_ERROR = "SERIALIZATION_ERROR",
  UNKNOWN = "UNKNOWN",
}
```

## 🚀 Migration Guide

### From Legacy Storage

If migrating from the old `FileSystemStorage` class:

```typescript
// Old approach (deprecated)
import { FileSystemStorage } from "@atomiton/storage";
const storage = new FileSystemStorage("/path");

// New approach (recommended)
import { createFileSystem } from "@atomiton/storage/desktop";
const storage = createFileSystem({ baseDir: "/path" });
```

### Platform-Specific Migration

```typescript
// Detect environment and use appropriate import
if (typeof window !== "undefined") {
  // Browser environment
  const { createStorage } = await import("@atomiton/storage/browser");
  const storage = createStorage();
} else {
  // Node.js/desktop environment
  const { createStorage } = await import("@atomiton/storage/desktop");
  const storage = createStorage();
}
```

## 🔧 Development

```bash
# Install dependencies
pnpm install

# Build package
pnpm build

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Run tests
pnpm test

# Build in watch mode
pnpm dev
```

## 📖 Documentation

### Package-Specific

- [ROADMAP.md](./ROADMAP.md) - Development phases and planned features
- [SECURITY.md](./SECURITY.md) - Security implementation for storage

### Architecture Documentation

- **[Storage Architecture](../../docs/architecture/STORAGE.md)** - Complete
  system design and cross-platform strategy
- **[Package Integration Guide](../../docs/guides/PACKAGE_INTEGRATION.md)** -
  Using storage in your applications

## 🤝 Contributing

1. Focus on platform compatibility and performance
2. Maintain the universal interface contract
3. Include comprehensive tests for new engines
4. Update documentation for new features
5. Follow the existing factory function patterns

## License

MIT - See [LICENSE](../../LICENSE) for details
