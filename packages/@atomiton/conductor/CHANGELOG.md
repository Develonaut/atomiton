# Changelog

All notable changes to @atomiton/conductor will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial package structure
- Documentation for Blueprint execution
- Documentation for execution strategy
- Documentation for IPC integration
- ROADMAP with 6-week development plan

### Changed

- Migrated Blueprint storage functionality to @atomiton/storage package
- Updated to use universal storage abstraction instead of direct filesystem access
- Removed yaml dependency in favor of @atomiton/storage

### Planned

- ExecutionEngine class for Blueprint orchestration
- NodeExecutor for individual node execution
- IPC integration with @atomiton/events
- Sequential and parallel execution strategies

## [0.0.1] - 2025-01-11

### Added

- Package created with initial structure
- Core documentation and planning

[Unreleased]: https://github.com/atomiton/atomiton/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/atomiton/atomiton/releases/tag/v0.0.1
