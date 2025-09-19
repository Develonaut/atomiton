# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-01-19

### Added

- New split export pattern with `/browser` and `/desktop` entry points for environment-specific builds
- Dedicated `browser.ts` and `desktop.ts` export files for cleaner module separation
- TypeScript runtime and scalable queue exports for desktop environment

### Changed

- **BREAKING**: Removed default export - must now import from `/browser` or `/desktop` paths
  - Example: `import { createConductor } from "@atomiton/conductor/desktop"`
- Refactored package.json exports to use explicit path-based exports instead of default
- Updated Vite configuration to build separate bundles for browser and desktop environments
- Improved event handling in enhanced execution engine with cleaner async patterns
- Simplified webhook manager error handling and response patterns
- Optimized queue factory with better type safety and reduced complexity
- Enhanced execution store with improved state management

### Fixed

- Import path issues in desktop applications now properly resolved with explicit export paths
- Event handler memory leaks through improved cleanup patterns
- Queue initialization race conditions

## [0.1.0] - Previous

### Added

- Initial conductor package setup
- Core execution engine
- Queue management system
- Composite runner functionality

### Changed

- Renamed files from PascalCase to camelCase for consistency

### Fixed

- TypeScript and ESLint configuration issues
