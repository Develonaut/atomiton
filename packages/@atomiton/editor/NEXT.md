# Next Work Queue - @atomiton/editor

## Overview

Upcoming work for the @atomiton/editor package, prioritized by user impact and technical dependencies.

## Priority Queue

### 1. 🔴 Node Inspector (Critical - Current Sprint)

**Why Critical**: Users can add nodes but cannot configure them, making the editor non-functional for creating actual workflows.

**Tasks**:

- [ ] Create `NodeInspector` component for right sidebar
- [ ] Connect selection state to inspector display
- [ ] Build property field components:
  - [ ] `TextField` for string inputs
  - [ ] `NumberField` with validation
  - [ ] `SelectField` for dropdown options
  - [ ] `CheckboxField` for boolean values
  - [ ] `CodeEditor` for script fields
- [ ] Implement form state management
- [ ] Add real-time property updates to store
- [ ] Support validation and error display
- [ ] Add property grouping/sections

**Acceptance Criteria**:

- Selecting a node shows its properties in right sidebar
- Changes to properties update immediately
- Validation prevents invalid configurations
- UI clearly indicates required vs optional fields

---

### 2. 🔴 Data Flow Connections (Critical - Next Sprint)

**Why Critical**: Without connections, nodes are isolated and workflows cannot function.

**Tasks**:

- [ ] Implement connection ports on nodes
- [ ] Add visual connection handles
- [ ] Create connection drag interaction
- [ ] Implement connection validation rules
- [ ] Add connection path rendering
- [ ] Support connection deletion
- [ ] Show data type compatibility

**Acceptance Criteria**:

- Users can drag from output to input ports
- Invalid connections are prevented
- Connections show data flow direction
- Connection paths are smooth and readable

---

### 3. 🟡 Workflow Execution (High Priority)

**Why Important**: The core value of the editor is running automations.

**Tasks**:

- [ ] Add Run/Stop buttons to toolbar
- [ ] Integrate with @atomiton/core execution engine
- [ ] Show execution state on nodes (running/complete/error)
- [ ] Display execution progress
- [ ] Show data flowing through connections
- [ ] Implement debug mode with breakpoints
- [ ] Add execution logs panel

**Acceptance Criteria**:

- Workflows can be executed from the editor
- Visual feedback shows execution progress
- Errors are clearly displayed
- Users can debug step-by-step

---

### 4. 🟡 Save/Load Blueprints (High Priority)

**Why Important**: Users need to persist their work.

**Tasks**:

- [ ] Implement Blueprint serialization format
- [ ] Add Save button/command
- [ ] Add Load dialog
- [ ] Support .atom file format
- [ ] Implement auto-save
- [ ] Add version tracking
- [ ] Support import/export

**Acceptance Criteria**:

- Blueprints can be saved to files
- Loading restores exact state
- File format is human-readable
- Auto-save prevents data loss

---

### 5. 🟢 Enhanced Canvas Features (Medium Priority)

**Tasks**:

- [ ] Multi-select with shift/cmd
- [ ] Copy/paste nodes
- [ ] Duplicate nodes
- [ ] Align and distribute tools
- [ ] Group/ungroup nodes
- [ ] Node search/filter
- [ ] Keyboard shortcuts
- [ ] Context menus

---

### 6. 🟢 Property Editor Enhancements (Medium Priority)

**Tasks**:

- [ ] Dynamic property schemas
- [ ] Custom property editors
- [ ] Property templates
- [ ] Conditional properties
- [ ] Property validation rules
- [ ] Rich editors (color picker, date picker)
- [ ] Array/object editors

---

### 7. 🟢 Visual Enhancements (Medium Priority)

**Tasks**:

- [ ] Node icons and thumbnails
- [ ] Custom node colors/themes
- [ ] Connection animations
- [ ] Execution visualizations
- [ ] Error state styling
- [ ] Success indicators
- [ ] Loading states

---

### 8. 🔵 Developer Experience (Low Priority)

**Tasks**:

- [ ] Node development tools
- [ ] Custom node templates
- [ ] Extension API
- [ ] Plugin system
- [ ] Performance profiling
- [ ] Debug overlays

---

## Technical Debt

- [ ] Increase test coverage to 80%
- [ ] Optimize re-renders in large graphs
- [ ] Improve TypeScript types
- [ ] Document component APIs
- [ ] Add Storybook stories
- [ ] Performance benchmarks

## Research & Exploration

- [ ] WebAssembly for performance
- [ ] GPU acceleration for rendering
- [ ] Alternative layout algorithms
- [ ] Real-time collaboration
- [ ] AI-assisted node configuration
- [ ] Voice commands

## Success Metrics

### Short Term (2 weeks)

- ✅ Node Inspector working
- ✅ Basic connections functional
- ✅ Can create simple workflows

### Medium Term (1 month)

- ✅ Workflows can execute
- ✅ Blueprints can be saved/loaded
- ✅ 10+ example workflows created

### Long Term (3 months)

- ✅ Full feature parity with competitors
- ✅ < 100ms response time for all operations
- ✅ Support for 1000+ node workflows

---

**Last Updated**: 2025-01-10
**Next Review**: 2025-01-17
**Sprint Length**: 1 week
