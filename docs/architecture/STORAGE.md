# Storage Architecture

## Overview

Atomiton's storage architecture provides a unified abstraction for storing and retrieving Blueprints, application data, and credentials across all supported platforms. The system automatically adapts to the runtime environment while maintaining a consistent API experience.

## Design Principles

### Universal Abstraction

**Single API, Multiple Backends:**

- Same interface works on desktop, browser, and cloud
- Automatic backend selection based on platform detection
- Progressive enhancement from simple to advanced features
- Future-proof design for new storage providers

### Platform Optimization

**Environment-Specific Features:**

- Desktop: File system with OS keychain integration
- Browser: IndexedDB with Web Crypto API encryption
- Cloud: Distributed storage with sync capabilities
- Development: Local files with environment variable fallbacks

## Architecture Overview

### Storage Factory Pattern

```typescript
// Auto-detection creates appropriate storage engine
const storage = await createStorage({ platform: "auto" });

// Or specify explicitly for specific needs
const storage = await createStorage({
  type: "filesystem", // Desktop local storage
  type: "indexeddb", // Browser persistent storage
  type: "cloud", // Atomiton cloud backend
  type: "memory", // Testing and development
});
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
│  FilesystemStorage │  │  IndexedDBStorage │  │   CloudStorage   │
│    (Desktop)      │  │    (Browser)      │  │   (Supabase)     │
└───────────────────┘  └───────────────────┘  └──────────────────┘
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│  OS File System│  │   Browser APIs   │  │  HTTP/WebSocket│
│   + Keychain   │  │  + Web Crypto    │  │   + Database   │
└────────────────┘  └─────────────────┘  └────────────────┘
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

### FilesystemStorage (Desktop)

**Location Strategy:**

- **Blueprints**: `~/Documents/Atomiton/Blueprints/`
- **Application Data**: OS-specific app data directory
- **Credentials**: OS keychain integration
- **Cache**: Temporary directory with auto-cleanup

**Features:**

- File watching for external changes
- Atomic write operations with backup
- Directory-based organization
- Metadata stored in companion files

**File Organization:**

```
~/Documents/Atomiton/
├── Blueprints/
│   ├── personal/
│   │   ├── workflow-1.blueprint.yaml
│   │   └── workflow-1.blueprint.meta.json
│   └── shared/
│       └── team-process.blueprint.yaml
├── Templates/
├── Exports/
└── .atomiton/
    ├── config.json
    └── cache/
```

### IndexedDBStorage (Browser)

**Database Schema:**

- **Blueprints**: Structured storage with indexing
- **Metadata**: Searchable fields and tags
- **Credentials**: Encrypted storage with Web Crypto API
- **Cache**: Temporary data with TTL

**Features:**

- Offline-first capabilities
- Background synchronization
- Quota management and cleanup
- Full-text search indexing

**Storage Structure:**

```typescript
// IndexedDB object stores
{
  blueprints: {
    keyPath: 'id',
    indexes: ['name', 'created', 'tags', 'author']
  },
  credentials: {
    keyPath: 'service',
    encrypted: true
  },
  metadata: {
    keyPath: 'path',
    indexes: ['type', 'modified']
  }
}
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

### Desktop Capabilities

**Advanced Features:**

- File system watching for external changes
- OS keychain integration for credentials
- Native file dialogs for import/export
- Background sync with cloud storage

**Performance Optimizations:**

- File-based caching strategies
- Lazy loading for large blueprints
- Incremental sync algorithms
- Local search indexing

### Browser Capabilities

**Web-Specific Features:**

- Offline-first storage with service workers
- Background synchronization
- Progressive Web App support
- Share API integration

**Limitations & Workarounds:**

- Storage quota management
- No direct file system access
- CORS restrictions for external APIs
- Security context requirements

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

- **[Security Architecture](./SECURITY.md)** - Security implementation across storage systems
- **[Storage Package](../../packages/@atomiton/storage/README.md)** - Package-specific usage and examples

### Integration Guides

- **[Package Integration](../guides/PACKAGE_INTEGRATION.md)** - Using storage in applications
- **[Development Principles](../guides/DEVELOPMENT_PRINCIPLES.md)** - Storage-aware development practices

---

**Last Updated**: 2025-09-17
**Architecture Review**: Required for significant changes
**Performance Baseline**: See benchmarks section for current metrics
