# @atomiton/storage

> Storage abstraction package for desktop Composite data (early development)

## Current Status

🚧 **EARLY DEVELOPMENT** - Only basic filesystem storage implemented.

**What actually works:**

- TypeScript interfaces and types defined
- `FileSystemStorage` class for desktop local file storage
- JSON serialization only (YAML planned)
- Basic CRUD operations (save/load/list/delete/exists)

**What doesn't exist yet:**

- `createStorage()` factory function
- Platform auto-detection
- Cloud storage providers (Google Drive, OneDrive, Dropbox)
- Browser IndexedDB storage
- YAML serialization
- Multi-platform support

## What Actually Exists

### FileSystemStorage

Currently the only implemented storage engine. Stores Composite data as JSON files in the local filesystem.

```typescript
import { FileSystemStorage } from "@atomiton/storage";

// Create filesystem storage (stores in ~/Atomiton/ by default)
const storage = new FileSystemStorage();

// Or specify custom directory
const storage = new FileSystemStorage("/path/to/custom/dir");

// Save data (JSON only, despite what options suggest)
await storage.save("my-composite", compositeData, {
  format: "yaml", // Ignored - always saves as JSON
  metadata: { author: "user@example.com" },
});

// Load data
const composite = await storage.load("my-composite");

// List stored items
const items = await storage.list("composites/");

// Check if exists
const exists = await storage.exists("my-composite");

// Delete
await storage.delete("my-composite");

// Get storage info
const info = storage.getInfo(); // Returns type: "filesystem", platform: "desktop"
```

### Type Definitions

Comprehensive TypeScript interfaces are defined but most storage engines don't exist yet:

```typescript
// This interface is implemented by FileSystemStorage only
interface IStorageEngine {
  save(key: string, data: unknown, options?: StorageOptions): Promise<void>;
  load(key: string): Promise<unknown>;
  list(prefix?: string): Promise<StorageItem[]>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  getInfo(): StorageInfo;
}

// Comprehensive error handling
class StorageError extends Error {
  code: StorageErrorCode;
  cause?: Error;
  context?: Record<string, unknown>;
}
```

### File Storage Details

- **Storage Location**: `~/Atomiton/` directory by default
- **File Format**: `.composite.json` files (despite YAML in variable names)
- **Directory Structure**: Preserves key path as nested directories
- **Metadata**: Extracted from Composite data when available

## Known Limitations

1. **Format Support**: Only JSON serialization works (YAML hardcoded to JSON)
2. **Platform Support**: Desktop filesystem only
3. **No Factory Function**: Must instantiate `FileSystemStorage` directly
4. **No Cloud Storage**: All cloud providers are unimplemented
5. **No Browser Support**: IndexedDB storage doesn't exist
6. **No Testing Storage**: MemoryStorage not implemented

## Planned Features

See [ROADMAP.md](./ROADMAP.md) for planned implementations including:

- Cloud storage providers (Google Drive, OneDrive, Dropbox)
- Browser IndexedDB support
- YAML serialization via @atomiton/nodes
- Platform auto-detection
- Storage factory function
- In-memory storage for testing

## Development

```bash
# Install dependencies
pnpm install

# Build package
pnpm build

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Tests (currently no tests implemented)
pnpm test
```

## Documentation

### Package-Specific

- [ROADMAP.md](./ROADMAP.md) - Development timeline for planned features
- [SECURITY.md](./SECURITY.md) - Planned security implementation for this package

### Architecture Documentation

- **[Storage Architecture](../../docs/architecture/STORAGE.md)** - Complete storage system design and cross-platform strategy
- **[Security Architecture](../../docs/architecture/SECURITY.md)** - Project-wide security implementation

**Note**: Package documentation reflects current implementation. Architecture documents describe the complete planned system.

## License

MIT
