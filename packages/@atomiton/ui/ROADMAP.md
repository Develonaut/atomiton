# UI Framework Roadmap

## Vision

Build a lightweight, composable UI framework that combines the best patterns
from modern component libraries with a CSS-first approach using Tailwind. This
framework will serve Atomiton's needs while being potentially useful for the
broader developer community.

## Current State (v0.1.0)

We have a Vite app with 60+ components, many of which are highly specific to the
Atomiton application. Our goal is NOT to build a generic UI library, but to
create a clean, maintainable component system for our specific needs.

## Phase 1: Foundation (✅ COMPLETE)

**Completed**: September 4, 2025

### Achieved

- ✅ Documentation structure and philosophy
- ✅ Core utilities (cn, extractStyleProps, CVA)
- ✅ Button reference implementation
- ✅ TypeScript-first approach
- ✅ Props-driven API design

## Phase 2: Core Component Refactoring (🚧 IN PROGRESS)

**Timeline**: September 2025  
**Goal**: Update our most-used components to the new pattern

### Components to Refactor

- Card - Used everywhere, needs style props
- Input - Standard input component
- Select - Compound component pattern
- Switch - Simplified API
- Tooltip - Standardized positioning

### New Primitives Needed

- Box - Basic layout primitive
- Stack - Vertical/horizontal layout
- Spinner - Loading states

## Phase 3: Complex Component Patterns (Q4 2025)

**Goal**: Establish patterns for app-specific components

### Compound Components

- Sidebar system (Container, Header, Section, Item)
- Dialog/Modal system with consistent patterns
- Form components with validation

### Application-Specific

- PromptInput - AI interaction
- Comment system - Collaboration
- Export system - File workflows
- Notification system

## Phase 4: Flow Editor Components (Q1 2026)

**Goal**: Specialized components for the Flow editor

### Editor Components

- Node components with consistent styling
- Connection lines and arrows
- Canvas controls (zoom, pan)
- Property panels
- Context menus

### Visual Feedback

- Drag and drop indicators
- Selection states
- Hover effects
- Animation system

## Phase 5: Production Readiness (Q2 2026)

**Goal**: Polish and optimization

### Performance

- Bundle size optimization (target < 50KB core)
- Tree-shaking improvements
- CSS purging strategy
- Lazy loading patterns

### Developer Experience

- Component playground improvements
- Visual regression test coverage
- Migration guides for legacy components
- API documentation

## Long-term Vision (2026 and Beyond)

### Potential Open Source Release

If successful internally, consider:

- Extracting as standalone package
- Publishing to npm as @atomiton/ui
- Creating documentation site
- Building community

### Advanced Features

- Theme builder interface
- Component AI assistant
- Figma integration
- Accessibility audit tools

## Success Metrics

### Technical Goals

- **Bundle Size**: < 50KB for core components
- **Performance**: < 10ms render time for complex components
- **TypeScript Coverage**: 100%
- **Accessibility**: WCAG 2.1 AA compliance

### Quality Goals

- **Component Coverage**: All UI needs met with standard components
- **Code Reuse**: 80% of UI built with shared components
- **Developer Velocity**: New features built 2x faster
- **Maintenance**: 50% reduction in UI bugs

## Design Principles

1. **Practical Over Perfect** - Build what we need, not everything
2. **Performance First** - Zero runtime overhead with CSS
3. **Developer Experience** - Clear, predictable APIs
4. **Beautiful Defaults** - Great looking without customization
5. **Composable** - Components that work together seamlessly

## Component Inventory Target

### Current (60+ components)

Many app-specific, some duplicated functionality

### Target (40-50 core components)

- 15-20 primitive components
- 10-15 composite components
- 10-15 application-specific components
- Clear separation and single responsibility

## Not in Scope

- ❌ Generic UI library for external use (initially)
- ❌ Supporting every possible use case
- ❌ Complex runtime theming
- ❌ CSS-in-JS solutions
- ❌ Legacy browser support

---

**Status**: 🟡 Active Development  
**Version**: 0.1.0  
**Last Updated**: 2025-09-04
