# Next Work Queue

> **Note**: This replaces the old TODO.md. All work tracking now happens in workspace/CURRENT.md and workspace/NEXT.md

## Priority Order

### 1. Mantine UI Migration 🎨 (PRIORITY)

**Why**: Beautiful UI is our key differentiator

#### Step 1: Vite Migration

- [ ] Follow strategy: [vite-migration.md](./strategies/vite-migration.md)
- [ ] 5-phase approach documented
- [ ] Estimated: 11 days

#### Step 2: Mantine Migration

- [ ] Follow strategy: [tailwind-to-mantine-migration.md](./strategies/tailwind-to-mantine-migration.md)
- [ ] 6-phase approach documented
- [ ] Apply Brainwave 2.0 aesthetic
- [ ] Create Brainwave 2.0 visual components
- [ ] Ensure "beautiful" benchmark achieved
- [ ] Extract to packages/ui once complete

### 2. Complete Domain Documentation

**Why**: Need clear architecture before building more

- [ ] Create ROADMAP.md for each domain
- [ ] Document existing nodes package
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

**Last Updated**: 2025-01-02
