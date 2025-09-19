# Changelog

All notable changes to the @atomiton/storage package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-01-19

### Added

- New split export pattern with `/browser` and `/desktop` entry points for environment-specific builds
- Explicit browser and desktop export modules for cleaner separation

### Changed

- **BREAKING**: Removed default export - must now import from `/browser` or `/desktop` paths
  - Example: `import { createStorage } from "@atomiton/storage/desktop"`
- Refactored package.json exports to use explicit path-based exports
- Updated Vite configuration for optimized multi-environment builds
- Simplified browser and desktop modules by removing redundant exports
- Updated tests to use new import paths

### Removed

- Default index.ts exports - replaced with environment-specific exports

## [0.1.0] - Previous

### Added

- FilesystemStorage class for desktop file system storage
- BlueprintSerializer for YAML ↔ JSON conversion
- SerializationError and StorageError with context tracking
- Complete storage engine implementation with universal API
- Blueprint metadata extraction and automatic timestamping
- Package structure and TypeScript configuration
- Core IStorageEngine interface with universal API
- Storage type definitions for multi-platform support
- Platform detection architecture (desktop/browser/cloud)
- Cloud storage provider planning (Google Drive, OneDrive, Dropbox)
- Tier-based storage feature model
- Comprehensive documentation and roadmap

### Changed

- Migrated Blueprint storage functionality from @atomiton/conductor
- Unified storage abstraction across all storage types

## [0.0.1] - 2025-01-11

### Added

- Initial package creation
- Universal storage abstraction architecture
- Interface definitions for cross-platform storage
- Foundation for cloud storage provider integration
- Development tooling and build configuration
