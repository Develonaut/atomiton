# Changelog

All notable changes to the @atomiton/events package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-01-19

### Added

- New split export pattern with `/browser` and `/desktop` entry points for environment-specific builds
- Factory functions: `createBrowserEventBus`, `createDesktopEventBus`, and `createLocalEventBus`
- Auto-forwarding setup for desktop IPC communication via `setupAutoForwarding`
- Environment-specific event bus implementations optimized for each platform

### Changed

- **BREAKING**: Removed default export - must now import from `/browser` or `/desktop` paths
  - Example: `import { createEventBus } from "@atomiton/events/desktop"`
- Modernized to functional factory pattern from class-based approach
- Refactored package.json exports to use explicit path-based exports
- Updated tests and benchmarks to use new factory pattern
- Removed centralized index.ts in favor of environment-specific entry points

### Removed

- Default index.ts export file - replaced with split exports

### Planned

- Further IPC optimizations
- Enhanced type safety for cross-process events

## [0.0.1] - 2025-01-11

### Added

- Initial package creation for unified event system
- Foundation for IPC communication architecture
- Event system planning and interface design
