# Practical UI Framework Roadmap

## Current Reality Check

We have a Vite app with 60+ components, many of which are highly specific to the Atomiton application. Our goal is NOT to build a generic UI library, but to create a clean, maintainable component system for our specific needs.

## Phase 0: Foundation & Utilities ✅ COMPLETE

**Status**: Done

- ✅ Documentation structure
- ✅ API design principles
- ✅ Component philosophy
- ✅ Naming conventions

## Phase 1: Core Infrastructure 🚧 CURRENT

**Timeline**: 3-4 days
**Goal**: Set up the utilities that make everything else clean

### Primitive Utilities

- [ ] **cn utility** - Combine clsx + tailwind-merge
- [ ] **extractStyleProps** - Handle style props consistently
- [ ] **CVA setup** - Variant management
- [ ] **Type definitions** - StyleProps, common types

### File Organization

- [ ] Create `src/utils/` structure
- [ ] Create `src/types/` for shared types
- [ ] Set up proper exports

### Showcase App Updates

- [ ] Update existing Vite app pages to demonstrate patterns
- [ ] Create component playground pages

## Phase 2: Refactor Core Components

**Timeline**: 1 week
**Goal**: Update our most-used components to the new pattern

### Button (Reference Implementation)

- [ ] Migrate to new structure (types, styles, component files)
- [ ] Add style props support
- [ ] Update to semantic variants (primary, secondary, ghost)
- [ ] Add proper data attributes
- [ ] Update showcase page

### Essential Components to Refactor

Based on actual usage in the app:

1. **Card** - Used everywhere, needs style props
2. **Switch** - Simplify API, add sizes
3. **Select** - Convert to compound pattern
4. **Tooltip** - Standardize positioning
5. **Group** - Add Stack variant

### Create Missing Essentials

1. **Input** - We don't have a standard input!
2. **Box** - Basic layout primitive
3. **Stack** - Vertical/horizontal layout
4. **Spinner** - Extract from other components

## Phase 3: Complex Component Patterns

**Timeline**: 1 week
**Goal**: Establish patterns for our app-specific components

### Sidebar Components

Our app has multiple complex sidebars:

- DesignAndAnimationSidebar
- SceneAndAssetsSidebar
- HomeSidebar

Create a consistent pattern:

- [ ] Sidebar.Container
- [ ] Sidebar.Header
- [ ] Sidebar.Section
- [ ] Sidebar.Item

### Modal/Dialog System

We have various modal-like components:

- Export
- Settings
- ShareFile
- Invite

Standardize around:

- [ ] Dialog compound component
- [ ] Consistent open/close patterns
- [ ] Shared overlay behavior

### Form Components

Consolidate form-related components:

- [ ] Form.Field wrapper
- [ ] Form.Label
- [ ] Form.Error
- [ ] Consistent validation patterns

## Phase 4: Application-Specific Components

**Timeline**: Ongoing
**Goal**: Gradually improve app-specific components

These components are unique to Atomiton and don't need full framework treatment, but should follow our patterns where possible:

### High Priority (Used on many pages)

- PromptInput - AI prompt interface
- Comment system - Collaborative features
- Export system - File export workflows
- Notification system

### Medium Priority (Important but contained)

- VideoPlayer
- ColorPicker
- Upload components
- Asset management

### Low Priority (Working fine as-is)

- 3D-specific components
- Animation controls
- Camera controls

## Phase 5: Documentation & Testing

**Timeline**: Ongoing
**Goal**: Ensure maintainability

### Documentation

- [ ] Component usage examples in showcase app
- [ ] Migration guide for existing code
- [ ] Best practices guide

### Testing Strategy

- [ ] Critical path components only
- [ ] Visual regression with Playwright
- [ ] No unit tests for simple components

## Success Metrics

### What Success Looks Like

- ✅ Opening any component feels "clean and welcoming"
- ✅ New developers can understand patterns immediately
- ✅ Consistent API across all components
- ✅ Style props eliminate most className needs
- ✅ Components are composable and predictable

### What We're NOT Doing

- ❌ Building a generic UI library
- ❌ Supporting every possible use case
- ❌ Adding Storybook (using Vite app instead)
- ❌ Creating components we don't need
- ❌ Over-engineering simple components

## Implementation Priority

### Week 1: Foundation

1. Create utilities (cn, extractStyleProps)
2. Refactor Button as reference
3. Update Card and Input
4. Create Box and Stack

### Week 2: Core Components

1. Refactor remaining essentials
2. Create compound Dialog
3. Standardize Sidebars
4. Update showcase app

### Week 3: Polish

1. Application-specific improvements
2. Documentation updates
3. Migration of existing usages
4. Performance optimization

## Component Inventory

### Currently Have (60+ components)

**Core**: Button, Card, Switch, Select, Tooltip
**Layout**: Group, Folder, Tabs
**Feedback**: Notifications, Comments
**Complex**: Multiple sidebars, Export system, Settings
**App-Specific**: PromptInput, VideoPlayer, 3D controls

### Actually Need to Create

**Essential**: Input, Box, Stack, Spinner
**Useful**: Alert, Badge, Divider

### Don't Need (from original roadmap)

- Table (app doesn't use tables)
- Pagination (not needed yet)
- Progress bars (minimal usage)
- Date pickers (not in current app)
- Breadcrumbs (navigation is different)

## Next Immediate Steps

1. **Today**: Create cn utility and extractStyleProps
2. **Tomorrow**: Refactor Button as reference implementation
3. **This Week**: Get core components updated
4. **Next Week**: Tackle complex component patterns

This is a practical roadmap based on what we actually have and need, not an idealized framework vision.
