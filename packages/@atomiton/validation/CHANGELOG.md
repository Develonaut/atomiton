# Changelog - @atomiton/validation

All notable changes to this package will be documented in this file.

## [0.1.0] - 2025-09-17

### Added

- Initial package creation
- Direct re-export of Zod library
- Four essential validators:
  - `validators.uuid` - UUID v4 validation
  - `validators.email` - Email validation
  - `validators.url` - URL validation
  - `validators.semver` - Semantic version validation
- Full TypeScript support with type declarations
- Comprehensive test suite with smoke tests and benchmarks
- Documentation including README, ROADMAP, and migration guide

### Changed

- Simplified from initial 200+ line implementation to 16 lines after review
- Removed all unnecessary abstractions and wrapper functions

### Migration

- Migrated @atomiton/form from direct Zod usage
- Migrated @atomiton/nodes from direct Zod usage
