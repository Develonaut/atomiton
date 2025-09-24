# Storage Architecture

## Overview

Atomiton's storage architecture provides a unified abstraction for storing and
retrieving Blueprints, application data, and credentials across all supported
platforms. The system automatically adapts to the runtime environment while
maintaining a consistent API experience.

## Design Principles

### Universal Abstraction

**Single API, Multiple Backends:**

- Same interface works on desktop, browser, and cloud
- Automatic backend selection based on platform detection
- Progressive enhancement from simple to advanced features
- Future-proof design for new storage providers

### Split Exports Optimization

**Bundle-Aware Architecture:**

- Separate `/browser` and `/desktop` exports prevent dependency bloat
- Platform-specific engines only included where they can run
- No main export to force explicit platform selection
- Consistent with ecosystem patterns (`@atomiton/nodes`)

**Current Platform Support:**

- **Desktop**: FileSystem storage with Memory fallback
- **Browser**: Memory storage with IndexedDB planned (Phase 1)
- **Testing**: Memory storage available on both platforms
- **Future**: Cloud storage planned for both platforms

## Architecture Overview

### Split Exports Factory Pattern

The storage package uses split exports to optimize bundle sizes and provide
platform-specific capabilities:

```typescript
// Browser usage - optimized bundle without Node.js dependencies
import { createStorage, createMemory } from "@atomiton/storage/browser";
const storage = createStorage(); // Memory with persistence warning (Phase 0)

// Desktop usage - includes filesystem support
import {
  createStorage,
  createFileSystem,
  createMemory,
} from "@atomiton/storage/desktop";
const storage = createStorage(); // Filesystem in user home directory

// Explicit engine selection (recommended)
const fileStorage = createStorage({
  engine: createFileSystem({ baseDir: "./data" }),
});
const memoryStorage = createStorage({ engine: createMemory() });
```

### Storage Engine Hierarchy

```
┌──────────────────────────────────────────────────────────┐
│                    IStorageEngine                        │
│         (Universal API - All Platforms)                 │
└──────────────────────────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│ FileSystemStorage │  │  MemoryStorage   │  │   Future: Cloud  │
│  (/desktop only)  │  │ (both exports)   │  │  IndexedDB, etc  │
└───────────────────┘  └───────────────────┘  └──────────────────┘
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│  OS File System│  │  Native Objects  │  │  Platform APIs  │
│   + Atomic IO  │  │  + Fast Access   │  │  + Persistence  │
└────────────────┘  └─────────────────┘  └────────────────┘

Split Exports Pattern:
@atomiton/storage/browser  ← Memory (+ future IndexedDB)
@atomiton/storage/desktop  ← Memory + FileSystem
```

## Core Storage Interface

### Universal API

```typescript
interface IStorageEngine {
  // Basic CRUD operations
  save(key: string, data: any, options?: StorageOptions): Promise<void>;
  load(key: string): Promise<any>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;

  // Discovery and organization
  list(prefix?: string): Promise<StorageItem[]>;
  search(query: StorageQuery): Promise<StorageItem[]>;

  // Metadata and diagnostics
  getInfo(): StorageInfo;
  getCapabilities(): StorageCapabilities;
}
```

### Storage Options

```typescript
interface StorageOptions {
  format?: "json" | "yaml" | "binary";
  encrypt?: boolean;
  compress?: boolean;
  metadata?: Record<string, any>;
  expiration?: Date;
  tags?: string[];
}
```

## Storage Engine Implementations

### FileSystemStorage (Desktop Only)

Created via `createFileSystem()` from `@atomiton/storage/desktop`:

**Current Implementation:**

- **Default Location**: `~/.atomiton/` directory
- **File Format**: JSON files with configurable extensions
- **Organization**: Key paths become nested directories
- **Operations**: Atomic writes with directory creation

**Usage:**

```typescript
import { createFileSystem } from "@atomiton/storage/desktop";

// Default configuration
const storage = createFileSystem(); // Uses ~/.atomiton

// Custom configuration
const storage = createFileSystem({
  baseDir: "~/Documents/Atomiton",
  createDirectories: true,
  permissions: 0o755,
});
```

**File Organization Example:**

```
~/.atomiton/
├── blueprints/
│   ├── workflow-1.json
│   └── data-pipeline.json
├── templates/
│   └── starter-template.json
└── user-preferences.json
```

### MemoryStorage (All Platforms)

Created via `createMemory()` from both exports:

**Current Implementation:**

- **Storage**: In-memory JavaScript objects
- **Performance**: Fastest possible access
- **Persistence**: None (data lost on restart)
- **Use Cases**: Testing, temporary data, browser fallback

**Usage:**

```typescript
import { createMemory } from "@atomiton/storage/browser";
// OR
import { createMemory } from "@atomiton/storage/desktop";

// Basic memory storage
const storage = createMemory();

// With configuration
const storage = createMemory({
  maxItems: 1000,
  maxSizeBytes: 10 * 1024 * 1024, // 10MB limit
});
```

### Future: IndexedDBStorage (Browser - Phase 1)

**Planned Implementation:**

- **Database**: IndexedDB with structured storage
- **Persistence**: Survives browser restarts
- **Features**: Offline-first, quota management
- **Export**: Added to `@atomiton/storage/browser`

**Planned Structure:**

```typescript
// Future IndexedDB implementation
import { createIndexedDB } from "@atomiton/storage/browser";

const storage = createIndexedDB({
  dbName: "atomiton-storage",
  version: 1,
  stores: ["blueprints", "templates", "preferences"],
});
```

### CloudStorage (Distributed)

**Backend Architecture:**

- **Primary**: Supabase for user data and metadata
- **Storage**: File storage with CDN distribution
- **Sync**: Real-time updates via WebSocket
- **Backup**: Automated versioning and recovery

**Data Distribution:**

```
Supabase Database
├── users (authentication)
├── blueprints (metadata)
├── shares (collaboration)
└── versions (history)

File Storage (S3-compatible)
├── blueprints/
├── templates/
└── exports/
```

## Data Organization

### Blueprint Storage

**Structure Hierarchy:**

```
storage://
├── blueprints/
│   ├── {user-id}/          # Personal blueprints
│   ├── shared/             # Team/public blueprints
│   └── templates/          # Reusable templates
├── credentials/            # Encrypted API keys
├── preferences/            # User settings
└── cache/                  # Temporary data
```

**Blueprint Metadata:**

```typescript
interface BlueprintMeta {
  id: string;
  name: string;
  description?: string;
  author: string;
  created: Date;
  modified: Date;
  version: string;
  tags: string[];
  public: boolean;
  encrypted: boolean;
}
```

### Security Integration

**Credential Storage:**

- Automatic encryption for sensitive data
- Platform-specific secure storage backends
- Clear separation of public and private data
- User control over encryption preferences

**Access Control:**

- User-based isolation for personal data
- Role-based access for shared blueprints
- Audit logging for sensitive operations
- Secure sharing and collaboration features

## Platform-Specific Features

### Desktop Capabilities (Current)

**Available via `@atomiton/storage/desktop`:**

- **FileSystem Storage**: Direct file system access with atomic operations
- **Memory Storage**: Fast in-memory operations for testing
- **Smart Defaults**: Automatic ~/.atomiton directory selection
- **Cross-Platform**: Works on Windows, macOS, and Linux

**Current Features:**

- JSON serialization with configurable file extensions
- Directory-based organization following key paths
- Atomic write operations with error handling
- Platform-specific home directory detection

### Browser Capabilities (Current)

**Available via `@atomiton/storage/browser`:**

- **Memory Storage**: In-memory operations with optional size limits
- **Bundle Optimization**: No Node.js dependencies included
- **Future-Ready**: Prepared for IndexedDB implementation

**Current Limitations:**

- Memory storage only (data lost on refresh)
- No persistent storage until Phase 1 (IndexedDB)
- Warning message for non-persistent storage

**Planned Browser Features (Phase 1):**

- IndexedDB for persistent storage
- localStorage fallback for simple data
- Offline-first capabilities
- Web Crypto API integration

### Cloud Capabilities

**Collaboration Features:**

- Real-time collaborative editing
- Version history and conflict resolution
- Team workspace management
- Public blueprint sharing

**Sync Strategies:**

- Optimistic updates with conflict resolution
- Incremental sync for large datasets
- Offline queue with retry logic
- Background sync with priority queuing

## Migration & Compatibility

### Cross-Platform Migration

**Scenarios:**

- Desktop to Cloud: Full sync with encryption
- Browser to Desktop: Export/import with validation
- Legacy to Modern: Automatic format conversion
- Team Migration: Bulk operations with progress tracking

**Migration Process:**

```typescript
// Automatic migration detection and execution
const migrator = createMigrator(fromStorage, toStorage);
await migrator.migrate({
  validate: true,
  backup: true,
  progress: (status) => updateUI(status),
});
```

### Format Evolution

**Versioning Strategy:**

- Semantic versioning for storage schemas
- Backward compatibility for at least 2 major versions
- Automatic migration between compatible versions
- Clear deprecation warnings and migration paths

## Performance Characteristics

### Benchmarks by Platform

| Operation      | Desktop | Browser | Cloud  | Target     |
| -------------- | ------- | ------- | ------ | ---------- |
| Save Blueprint | <50ms   | <100ms  | <500ms | Invisible  |
| Load Blueprint | <20ms   | <50ms   | <200ms | Invisible  |
| List Items     | <100ms  | <200ms  | <1s    | Responsive |
| Search         | <200ms  | <500ms  | <2s    | Responsive |
| Sync           | <1s     | <2s     | <5s    | Background |

### Optimization Strategies

**Caching:**

- Memory cache for frequently accessed data
- Disk cache for offline availability
- CDN cache for shared templates
- Smart invalidation strategies

**Lazy Loading:**

- Progressive loading of large datasets
- On-demand credential decryption
- Streaming for large blueprint files
- Background prefetching of likely-needed data

## Error Handling & Recovery

### Fault Tolerance

**Error Categories:**

- **Network**: Retry with exponential backoff
- **Storage**: Graceful degradation to alternative backends
- **Corruption**: Automatic recovery from backups
- **Quota**: Cleanup strategies and user notification

**Recovery Strategies:**

```typescript
// Automatic fallback chain
const storage = createStorage({
  primary: "cloud",
  fallbacks: ["filesystem", "memory"],
  retryPolicy: {
    attempts: 3,
    backoff: "exponential",
  },
});
```

### Data Integrity

**Validation:**

- Schema validation for all stored data
- Checksum verification for critical files
- Atomic operations with rollback capability
- Regular integrity checks and repair

## Monitoring & Analytics

### Operational Metrics

**Performance Tracking:**

- Operation latencies by storage type
- Error rates and retry success rates
- Storage utilization and growth trends
- Sync performance and conflict rates

**User Experience:**

- Time to first blueprint load
- Offline availability metrics
- Collaboration effectiveness measures
- Migration success rates

### Debugging Support

**Diagnostic Tools:**

- Storage engine status and capabilities
- Operation history and audit logs
- Performance profiling and bottleneck detection
- Data consistency verification tools

## Future Enhancements

### Planned Features

**Enhanced Cloud Storage:**

- Multi-region replication for performance
- Advanced collaboration features
- Enterprise compliance capabilities
- Advanced sharing and permissions

**Performance Improvements:**

- Background sync optimization
- Intelligent caching strategies
- Compression and deduplication
- Advanced search capabilities

### Research Areas

**Emerging Technologies:**

- WebAssembly for performance-critical operations
- Advanced encryption schemes for enhanced security
- Peer-to-peer sync for team collaboration
- AI-powered organization and search

## Related Documentation

### Implementation Details

- **[Security Architecture](./SECURITY.md)** - Security implementation across
  storage systems
- **[Storage Package](../../packages/@atomiton/storage/README.md)** -
  Package-specific usage and examples

### Integration Guides

- **[Package Integration](../guides/PACKAGE_INTEGRATION.md)** - Using storage in
  applications
- **[Development Principles](../guides/DEVELOPMENT_PRINCIPLES.md)** -
  Storage-aware development practices

---

**Last Updated**: 2025-09-17 **Architecture Review**: Required for significant
changes **Performance Baseline**: See benchmarks section for current metrics
