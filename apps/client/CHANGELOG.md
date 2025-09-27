# Changelog - @atomiton/client

## [0.1.1] - 2025-01-15

### Changed

- **BREAKING**: Refactored flow store to use ICompositeNode directly instead of
  extended Flow type
- Moved flow hooks to be co-located with store at `stores/flow/hooks/`
- Replaced `useFlows` hook with separate `useComposites` and `useTemplates`
  hooks for better separation of concerns
- Replaced template detection from keywords to ownership model using `authorId`

### Added

- Proper ownership model for flows using `metadata.authorId`
- Automatic flow copying when loading flows not owned by current user
- Selector pattern for flow store state access
- `saveFlow` action that handles both create and update operations
- Hardcoded `CURRENT_USER_ID` with TODO for future user store integration
- Added `/editor` route for creating new flows
- Comprehensive smoke tests for flow creation and loading
- Page objects for My Scenes, Editor, and Explore pages

### Removed

- Removed unused UI module (setLoading, setDirty, setError, clearError)
- Removed `deleteFlow` and `clearAll` actions (YAGNI)
- Removed `parseFlow` utility function
- Removed `initializeTemplates` - templates are not pre-loaded
- Removed persistence module - using store's built-in persistence

### Fixed

- Fixed critical `useStore` import issue by exporting from @atomiton/store
  package
- Fixed type safety issues by removing `any` casts for author field
- Fixed missing `/editor` route in router configuration
- Fixed test selectors to match actual DOM structure

## [0.1.0] - Initial Release
