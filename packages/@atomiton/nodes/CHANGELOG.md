# Changelog - @atomiton/nodes

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
