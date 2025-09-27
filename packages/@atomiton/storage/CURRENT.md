# Current Work - Storage Package

## Sprint: September 13, 2025

### 🏗️ Package Cleanup - COMPLETED

**Recent Tasks (September 13, 2025):**

- [x] **Package structure** - Created @atomiton/storage with TypeScript config
- [x] **Core interfaces** - Defined IStorageEngine and universal API
- [x] **Serialization cleanup** - Removed redundant serialization directory, now
      using @atomiton/nodes
- [x] **FileSystemStorage** - Renamed from FilesystemStorage and updated to use
      nodes serialization
- [x] **Export updates** - Updated package exports to remove FlowSerializer, use
      FileSystemStorage
- [x] **Dependencies** - Removed yaml dependency (handled by @atomiton/nodes
      package)

### 🔍 Performance Research - PENDING

**Research needed:**

- [ ] **Library evaluation** - Research performant FileSystemStorage libraries
      for Node.js
- [ ] **Performance benchmarks** - Compare native fs vs specialized storage
      libraries
- [ ] **Feature comparison** - Evaluate features like atomic writes, indexing,
      compression

**Note**: Look for a performant library for FileSystemStorage functionality. The
current implementation uses native Node.js fs module, but specialized storage
libraries might offer better performance for frequent read/write operations.

### 📋 Architecture Updates - COMPLETE

**Completed September 13, 2025:**

- ✅ **Serialization unified** - All composite/node serialization now handled by
  @atomiton/nodes package
- ✅ **Package simplified** - Storage package focused purely on reading/writing
  to disk
- ✅ **Clean separation** - Storage handles disk I/O, nodes handles
  serialization/deserialization
- ✅ **Type consistency** - Using shared types from @atomiton/nodes for
  CompositeNodeDefinition
- ✅ **API exposed** - Serialization available via `nodes.serializer` API:
  ```typescript
  // Clean API for serialization
  nodes.serializer.toYaml(composite);
  nodes.serializer.fromYaml(yaml);
  nodes.serializer.toJson(composite);
  nodes.serializer.fromJson(json);
  ```

### 📋 Planning Phase - COMPLETE

**Completed January 11, 2025:**

- ✅ **Architecture designed** - Universal storage abstraction for
  multi-platform support
- ✅ **Storage types defined** - Filesystem, IndexedDB, cloud providers (Google
  Drive, OneDrive, Dropbox)
- ✅ **API interface designed** - Consistent save/load/list/delete operations
  across platforms
- ✅ **Platform strategy** - Auto-detection based on environment
  (desktop/browser/cloud)
- ✅ **Cloud integration planned** - Support for major cloud storage providers
- ✅ **Tier-based features** - Different limits/features per subscription tier

### 🔄 In Review

None

### ⚠️ Blocked

**Future cloud provider integrations:**

- Need API credentials and OAuth setup for Google Drive, OneDrive, Dropbox
- Cloud provider rate limits and quota management
- Authentication flow design across platforms

## Notes

The storage package provides universal storage abstraction that allows the same
API to work across desktop (filesystem), browser (IndexedDB), and cloud storage
providers (Google Drive, OneDrive, Dropbox). This ensures the app can run
anywhere without caring about storage implementation details.

Key architectural decisions:

- **Platform Agnostic**: Auto-detection of best storage type per environment
- **Future Proof**: Easy to add new storage backends without app changes
- **Cloud Ready**: Built-in support for popular cloud storage providers
- **Tier-Based**: Different storage limits/features per subscription level
- **Testing**: Mock and memory storage for reliable testing

This abstraction will enable:

- Desktop app with local file storage
- Browser app with IndexedDB + optional cloud sync
- Future cloud hosting with managed backend storage
- User choice of cloud storage provider (Google Drive, OneDrive, Dropbox)

---

**Last Updated**: 2025-09-13 **Status**: ✅ Package Cleanup Complete  
**Next Milestone**: Research performant FileSystemStorage library alternatives
