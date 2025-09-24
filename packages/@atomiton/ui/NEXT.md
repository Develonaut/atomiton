# Next Work Queue - @atomiton/ui

## Phase 2: Refactor Core Components 🚧 CURRENT

**Timeline**: 1 week (Started Sept 4, 2025)  
**Goal**: Update our most-used components to the new pattern

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

### Button Reference Implementation

- [ ] Update showcase page (component already refactored)

## Phase 3: Complex Component Patterns

**Timeline**: 1 week  
**Goal**: Establish patterns for our app-specific components

### Sidebar Components

Our app has multiple complex sidebars (DesignAndAnimationSidebar,
SceneAndAssetsSidebar, HomeSidebar).

Create a consistent pattern:

- [ ] Sidebar.Container
- [ ] Sidebar.Header
- [ ] Sidebar.Section
- [ ] Sidebar.Item

### Modal/Dialog System

Standardize our modal-like components (Export, Settings, ShareFile, Invite):

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

### High Priority (Used on many pages)

- **PromptInput** - AI prompt interface
- **Comment system** - Collaborative features
- **Export system** - File export workflows
- **Notification system**

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

### Documentation

- [ ] Component usage examples in showcase app
- [ ] Migration guide for existing code
- [ ] Best practices guide

### Testing Strategy

- [ ] Critical path components only
- [ ] Visual regression with Playwright
- [ ] No unit tests for simple components

## What We're NOT Doing

- ❌ Building a generic UI library
- ❌ Supporting every possible use case
- ❌ Adding Storybook (using Vite app instead)
- ❌ Creating components we don't need
- ❌ Over-engineering simple components

## Component Inventory

### Currently Have (60+ components)

**Core**: Button ✅, Card, Switch, Select, Tooltip  
**Layout**: Group, Folder, Tabs  
**Feedback**: Notifications, Comments  
**Complex**: Multiple sidebars, Export system, Settings  
**App-Specific**: PromptInput, VideoPlayer, 3D controls

### Actually Need to Create

**Essential**: Input, Box, Stack, Spinner  
**Useful**: Alert, Badge, Divider

### Don't Need (from idealized roadmap)

- Table (app doesn't use tables)
- Pagination (not needed yet)
- Progress bars (minimal usage)
- Date pickers (not in current app)
- Breadcrumbs (navigation is different)

---

**Last Updated**: 2025-09-04 **Next Review**: 2025-09-11
