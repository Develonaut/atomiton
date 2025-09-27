# Storage Package Roadmap

## Current State Summary

**✅ Phase 0 Complete** - Storage factory with functional programming pattern

The @atomiton/storage package now provides a robust foundation for universal
storage abstraction across platforms using functional programming patterns.

### Current Implementation (Phase 0)

**✅ Completed Features:**

- ✅ **Split Exports Pattern** - Browser/desktop optimized bundles with
  platform-specific capabilities
- ✅ **Functional Programming Pattern** - Clean factory functions following FP
  principles
- ✅ **Core Storage Types** - `memory` (all platforms), `filesystem` (desktop
  only)
- ✅ **Factory Functions** - `createMemory()`, `createFileSystem()`,
  `createStorage()` with smart defaults
- ✅ **Universal Interface** - `IStorageEngine` with
  save/load/delete/exists/list/getInfo methods
- ✅ **Type Safety** - Comprehensive TypeScript definitions for all storage
  operations
- ✅ **Error Handling** - Robust error management with StorageError class and
  specific error codes
- ✅ **Platform Detection** - Automatic platform detection for appropriate
  storage backend selection
- ✅ **Bundle Optimization** - No main export to prevent bloated bundles

**Split Exports API (Phase 0):**

```typescript
// Browser usage - optimized bundle size
import { createStorage, createMemory } from "@atomiton/storage/browser";

// Desktop usage - includes filesystem support
import {
  createStorage,
  createFileSystem,
  createMemory,
} from "@atomiton/storage/desktop";

// Smart factory with automatic selection
const storage = createStorage(); // Filesystem on desktop, memory on browser

// Direct factory functions
const fileStorage = createFileSystem({ baseDir: "./data" });
const memoryStorage = createMemory();

// Universal interface
await storage.save("flow-123", compositeData);
const data = await storage.load("flow-123");
const items = await storage.list("flow-");
```

## Future Storage Types

The functional programming architecture will scale to support additional storage
backends:

### Phase 1: Browser Support

- **`createIndexedDB()`** - Browser IndexedDB for client-side persistence (added
  to `/browser` export)
- **`createLocalStorage()`** - localStorage fallback for simple data (added to
  `/browser` export)
- **Enhanced browser detection** - Automatic IndexedDB + localStorage fallback
  in `createStorage()`

### Phase 2: Cloud Integration

- **`createGoogleDrive()`** - Google Drive API integration (both exports)
- **`createOneDrive()`** - Microsoft OneDrive API integration (both exports)
- **`createDropbox()`** - Dropbox API integration (both exports)
- **`createCloud()`** - Atomiton managed cloud backend (both exports)

### Phase 3: Advanced & Testing

- **`createMock()`** - Advanced testing with configurable behavior (both
  exports)
- **`createEncrypted()`** - Wrapper for encryption over any storage type (both
  exports)
- **`createCached()`** - Performance wrapper with caching layer (both exports)

## Implementation Phases

### Phase 1: Browser Support (Weeks 1-2)

**Goals:**

- Enable browser-based applications to store Composites and application data
- Seamless platform switching between desktop and browser
- Progressive Web App (PWA) support

**Deliverables:**

```typescript
// Phase 1 API additions to /browser export
import {
  createStorage,
  createIndexedDB,
  createLocalStorage,
} from "@atomiton/storage/browser";

const browserStorage = createIndexedDB({
  dbName: "atomiton-storage",
  version: 1,
});

// Enhanced auto-detection for browser
const storage = createStorage(); // Automatically uses IndexedDB (instead of memory warning)

// Fallback chain for browser environments
const storage = createStorage(); // IndexedDB -> localStorage -> memory
```

**Success Metrics:**

- Same API works across desktop and browser
- < 50ms storage operation latency
- Zero data loss during platform switches
- 95% test coverage

### Phase 2: Cloud Integrations (Weeks 3-6)

**Goals:**

- Multi-provider cloud storage support
- OAuth authentication flows
- Offline sync with conflict resolution
- User choice of storage provider

**Deliverables:**

```typescript
// Phase 2 API additions (available in both /browser and /desktop exports)
import {
  createGoogleDrive,
  createOneDrive,
  createDropbox,
  createCloud,
} from "@atomiton/storage/desktop";
// OR
import {
  createGoogleDrive,
  createOneDrive,
  createDropbox,
  createCloud,
} from "@atomiton/storage/browser";

const googleStorage = createGoogleDrive({
  clientId: "your-client-id",
  scopes: ["drive.file"],
});

const oneDriveStorage = createOneDrive({
  clientId: "your-client-id",
  redirectUri: "your-redirect-uri",
});

const dropboxStorage = createDropbox({
  appKey: "your-app-key",
});

// Managed cloud backend
const cloudStorage = createCloud({
  apiKey: "your-api-key",
  endpoint: "https://api.atomiton.com",
});
```

**Success Metrics:**

- Support 3+ cloud storage providers
- Offline sync with conflict resolution
- < 5MB storage footprint
- OAuth flows work seamlessly

### Phase 3: Enterprise Features (Weeks 7-10)

**Goals:**

- Enterprise-grade security and compliance
- Advanced testing capabilities
- Performance optimization
- Multi-provider failover

**Deliverables:**

```typescript
// Phase 3 API additions (available in both exports)
import {
  createEncrypted,
  createCached,
  createMock,
} from "@atomiton/storage/desktop";

const encryptedStorage = createEncrypted({
  underlying: createFileSystem({ baseDir: "./secure" }),
  encryption: { algorithm: "AES-256-GCM", keyDerivation: "PBKDF2" },
});

const cachedStorage = createCached({
  underlying: createGoogleDrive({ clientId: "id" }),
  cacheSize: 100,
  ttl: 300000, // 5 minutes
});

const mockStorage = createMock({
  latency: 100,
  failureRate: 0.1,
  quotaLimit: 1000000,
});
```

**Success Metrics:**

- Handle 10,000+ Flows per user
- Multi-provider failover < 2 seconds
- Encryption/decryption < 100ms overhead
- Enterprise-grade security compliance

## Architecture Evolution

### Split Exports Scalability

The split exports pattern scales elegantly as new storage types are added:

```typescript
// Split exports prevent bundle bloat
// /browser export
export {
  createMemory,
  createIndexedDB, // Phase 1
  createLocalStorage, // Phase 1
  createGoogleDrive, // Phase 2
  createOneDrive, // Phase 2
  createDropbox, // Phase 2
  createCloud, // Phase 2
  createMock, // Phase 3
  createEncrypted, // Phase 3
  createCached, // Phase 3
} from "./index";

// /desktop export
export {
  createMemory,
  createFileSystem,
  createIndexedDB, // Phase 1 (for Electron apps)
  createGoogleDrive, // Phase 2
  createOneDrive, // Phase 2
  createDropbox, // Phase 2
  createCloud, // Phase 2
  createMock, // Phase 3
  createEncrypted, // Phase 3
  createCached, // Phase 3
} from "./index";

// Smart createStorage() in each export
export function createStorage(config: { engine?: IStorageEngine } = {}) {
  return config.engine || getDefaultEngine();
}
```

### Composition Patterns

Advanced storage features will use composition:

```typescript
// Layered storage with encryption and caching
const storage = createCached({
  underlying: createEncrypted({
    underlying: createGoogleDrive({ clientId: "id" }),
    encryption: { algorithm: "AES-256-GCM" },
  }),
  cacheSize: 50,
});
```

## Migration Strategy

### From Phase 0 to Phase 1

- **Backward Compatibility** - All existing factory functions remain unchanged
- **API Extension** - New factories added without breaking changes
- **Auto-Detection** - Enhanced platform detection for browser environments
- **Testing** - Comprehensive test suite for cross-platform compatibility

### From Phase 1 to Phase 2

- **Cloud Provider Registration** - New cloud factories added to factory
  registry
- **Authentication Flow** - OAuth integration without changing core API
- **Migration Tools** - Utilities to transfer data between storage types
- **Conflict Resolution** - Automatic sync strategies for cloud storage

### From Phase 2 to Phase 3

- **Enterprise Wrappers** - Composition-based advanced features
- **Security Enhancements** - Encryption and audit logging layers
- **Performance Optimization** - Caching and batch operation wrappers
- **Monitoring Integration** - Health checks and analytics collection

## Benefits

### Developer Experience

- **Consistent API** - Same interface across all storage types
- **Functional Composition** - Clean, testable factory functions
- **Type Safety** - Full TypeScript support with platform-specific
  configurations
- **Easy Testing** - Mock and memory storage for reliable unit tests

### User Experience

- **Platform Freedom** - Same application works desktop, browser, and cloud
- **Storage Choice** - Users can choose their preferred cloud provider
- **Offline Support** - Local storage with optional cloud sync
- **Data Portability** - Easy migration between storage providers

### Architecture Benefits

- **Scalability** - Easy to add new storage backends
- **Maintainability** - Clean separation of concerns
- **Future Proof** - Ready for any platform or hosting model
- **Performance** - Platform-optimized storage implementations

## Risk Mitigation

| Risk                         | Impact | Mitigation Strategy                                        |
| ---------------------------- | ------ | ---------------------------------------------------------- |
| Cloud provider API changes   | High   | Abstract APIs, version pinning, fallback strategies        |
| Authentication complexity    | High   | OAuth libraries, comprehensive error handling              |
| Cross-platform compatibility | Medium | Extensive testing, feature detection, graceful degradation |
| Performance with large files | Medium | Streaming, chunking, lazy loading, progress callbacks      |
| Storage quota limits         | Medium | Quota monitoring, user notifications, tier management      |
| Data migration complexity    | Medium | Automated migration tools, validation, rollback support    |

---

**Last Updated**: 2025-09-18 **Current Phase**: Phase 0 Complete ✅ **Next
Phase**: Phase 1 - Browser Support **Owner**: @atomiton/storage team
