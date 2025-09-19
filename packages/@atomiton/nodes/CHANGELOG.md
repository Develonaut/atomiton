# Changelog - @atomiton/nodes

## [0.2.0] - 2025-01-19

### Changed

- **BREAKING**: Updated imports to use new split export patterns from dependencies
  - Must now import from `@atomiton/storage/browser` or `@atomiton/storage/desktop`
  - Must now import from `@atomiton/events/browser` or `@atomiton/events/desktop`
- Improved node validation with cleaner error handling
- Enhanced type safety in composite node validation
- Simplified atomic node exports by removing redundant re-exports

### Fixed

- Import path compatibility with updated dependency packages
- Node creation type inference improvements

## [0.1.1] - 2025-01-15

### Changed

- `createCompositeNode` now auto-generates ID if not provided using `generateNodeId()` from utils
- `CompositeNodeInput.id` is now optional

### Added

- Added `authorId?: string` field to `INodeMetadata` for ownership tracking
- Added composite templates: `data-transform.yaml` and `image-processor.yaml`
- Added `type: composite` field to template YAML definitions

### Fixed

- Improved type safety for composite node creation
- Fixed template parsing errors by adding required `type` field
- Improved error message formatting for template validation

## [0.1.0] - Initial Release
