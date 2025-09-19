# Changelog - @atomiton/client

## [0.1.1] - 2025-01-15

### Changed

- **BREAKING**: Refactored blueprint store to use ICompositeNode directly instead of extended Blueprint type
- Moved blueprint hooks to be co-located with store at `stores/blueprint/hooks/`
- Replaced `useBlueprints` hook with separate `useComposites` and `useTemplates` hooks for better separation of concerns
- Replaced template detection from keywords to ownership model using `authorId`

### Added

- Proper ownership model for blueprints using `metadata.authorId`
- Automatic blueprint copying when loading blueprints not owned by current user
- Selector pattern for blueprint store state access
- `saveBlueprint` action that handles both create and update operations
- Hardcoded `CURRENT_USER_ID` with TODO for future user store integration
- Added `/editor` route for creating new blueprints
- Comprehensive smoke tests for blueprint creation and loading
- Page objects for My Scenes, Editor, and Explore pages

### Removed

- Removed unused UI module (setLoading, setDirty, setError, clearError)
- Removed `deleteBlueprint` and `clearAll` actions (YAGNI)
- Removed `parseBlueprint` utility function
- Removed `initializeTemplates` - templates are not pre-loaded
- Removed persistence module - using store's built-in persistence

### Fixed

- Fixed critical `useStore` import issue by exporting from @atomiton/store package
- Fixed type safety issues by removing `any` casts for author field
- Fixed missing `/editor` route in router configuration
- Fixed test selectors to match actual DOM structure

## [0.1.0] - Initial Release
