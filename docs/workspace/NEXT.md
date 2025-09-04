# Next Work Queue

> **Note**: This replaces the old TODO.md. All work tracking now happens in workspace/CURRENT.md and workspace/NEXT.md

## Priority Order

### 1. Custom UI Framework Development 🎨 (PRIORITY)

**Why**: Beautiful, lightweight UI is our key differentiator

#### Step 1: Vite Migration ✅ COMPLETE

- ✅ Follow strategy: [vite-migration.md](./strategies/vite-migration.md)
- ✅ 5-phase approach documented
- ✅ All packages migrated to Vite (ui, core, nodes, theme)
- ✅ Estimated: 11 days (completed faster due to existing structure)

#### Step 2: Build Custom Tailwind-Based UI Framework

**New Direction**: Build our own lightweight, composable UI framework using:

- React for component logic
- Props and state-driven component APIs (not utility classes)
- Tailwind CSS for internal implementation
- Headless UI for accessible primitives
- Compound Component patterns for composition
- Optional className prop for customization

**Goals**:

- [ ] Create lightweight alternative to heavy runtime-styled frameworks
- [ ] Take inspiration from Radix, Material UI, Mantine's best patterns
- [ ] Props-driven API (variant="primary" size="lg") not utility classes
- [ ] Tailwind powers the implementation, not the API
- [ ] Apply Brainwave 2.0 aesthetic as the default theme
- [ ] Make it reusable - potentially open-source for others
- [ ] Keep components composable and customizable
- [ ] Extract to packages/ui as a standalone framework

**Advantages**:

- Zero runtime styling overhead
- Full control over component behavior
- Smaller bundle size
- CSS-based with Tailwind utilities
- Can become its own project/product

### 2. Complete Domain Documentation

**Why**: Need clear architecture before building more

- ✅ Create ROADMAP.md for each domain (completed in previous work)
- ✅ Document existing nodes package (completed in previous work)
- [ ] Document existing electron package
- [ ] Create workflow domain spec

### 3. Build DI Package

**Why**: Foundation for all services (n8n's best pattern)

- [ ] Create @atomiton/di package
- [ ] Implement decorators with reflect-metadata
- [ ] Add container system
- [ ] Write tests

### 4. Wire Core to UI

**Why**: Connect existing functionality after UI is beautiful

- [ ] Connect EventClient to React
- [ ] Use storage for persistence
- [ ] Integrate Brainwave theme system
- [ ] Test platform detection

## Future Considerations

### Node System

- Design node plugin architecture
- Create 5-10 essential nodes
- Build node registry
- Implement hot reload

### Workflow Engine

- Streaming execution
- DAG processing
- State management
- Error handling

### Desktop App

- Electron wrapper
- Auto-updates
- OS integration
- File associations

## Ideas to Explore

- WebAssembly for compute nodes
- AI-assisted node connections
- Visual debugging overlay
- Blueprint marketplace

---

**Last Updated**: 2025-09-04
