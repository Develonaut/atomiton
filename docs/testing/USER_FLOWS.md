# Critical User Flows - Atomiton Editor

These are the core user workflows that MUST work for the application to be functional. Playwright tests should verify these paths.

## 🎯 Primary User Flows

### 1. **Gallery-to-Editor Flow** ⭐ NEW

**User Goal**: Load a blueprint from the gallery into the editor

**Critical Path**:

1. ✅ User visits home page
2. ✅ User sees available blueprints/gallery items
3. ✅ User clicks on a blueprint card
4. ✅ User is navigated to `/editor/:id` route
5. ✅ Editor loads with canvas visible
6. ✅ Blueprint YAML is fetched and parsed
7. ✅ Nodes appear on canvas with correct types
8. ✅ Node data (positions, properties) is loaded correctly

**Tests Required**:

- Gallery items are clickable
- Navigation to editor works
- Blueprint loading from YAML works
- Nodes render with correct test IDs
- Expected node types are present (e.g., code, transform)
- No JavaScript errors during load

**Current Test Status**: ✅ **IMPLEMENTED** - `gallery-editor-flow.spec.ts`

### 2. **Node Management Flow**

**User Goal**: Add and configure nodes in the editor

**Critical Path**:

1. ✅ User can see available nodes in the palette (left sidebar)
2. ✅ User can add a node to the canvas (drag or click)
3. ✅ Node appears on the canvas at correct position
4. ✅ User can select a node (click on canvas or scene list)
5. ✅ Selected node properties display in right sidebar
6. 🚧 User can edit node properties
7. 🚧 Property changes persist to the node

**Tests Required**:

- Store can add nodes
- Canvas renders nodes
- Selection synchronizes between canvas and UI
- Properties display for selected nodes

### 2. **Workflow Creation Flow**

**User Goal**: Build a working automation workflow

**Critical Path**:

1. ✅ User can add multiple nodes
2. 🚧 User can connect nodes (draw connections)
3. 🚧 Connections validate (compatible types)
4. 🚧 User can delete nodes and connections
5. 🚧 User can run the workflow
6. 🚧 Execution status shows on nodes

**Tests Required**:

- Multiple nodes can be added
- Connections can be created
- Deletion works correctly
- Workflow execution starts

### 3. **Save/Load Flow**

**User Goal**: Persist and restore work

**Critical Path**:

1. 🚧 User can save a Blueprint
2. 🚧 Save creates valid .atom file
3. 🚧 User can load a Blueprint
4. 🚧 Load restores exact state
5. 🚧 Auto-save prevents data loss

**Tests Required**:

- Serialization works
- Deserialization restores state
- File format is valid

### 4. **Canvas Navigation Flow**

**User Goal**: Navigate and organize the workspace

**Critical Path**:

1. ✅ User can pan the canvas
2. ✅ User can zoom in/out
3. ✅ Minimap shows overview
4. ✅ Grid helps with alignment
5. ✅ Keyboard shortcuts work (Delete key)

**Tests Required**:

- Pan/zoom handlers work
- Minimap renders
- Keyboard handlers respond
- Delete key removes selected nodes

## 🔥 Smoke Test Coverage

### Phase 1: Current Implementation (What's Built)

```javascript
// These should be in our smoke tests NOW
tests = [
  "Gallery-to-Editor navigation works", // ✅ IMPLEMENTED
  "Blueprint YAML loading works", // ✅ IMPLEMENTED
  "Nodes render with test IDs", // ✅ IMPLEMENTED
  "Editor store can manage nodes",
  "Canvas renders and updates",
  "Node selection works",
  "Properties display for nodes",
  "Keyboard shortcuts work",
  "Pan/zoom functions work",
];
```

### Phase 2: Next Priority (Being Built)

```javascript
// Add these as we build features
tests = [
  "Node properties can be edited",
  "Connections can be created",
  "Workflow can execute",
  "Basic save/load works",
];
```

### Phase 3: Full Coverage (Future)

```javascript
// Complete smoke suite
tests = [
  "Full workflow creation",
  "Complex node configurations",
  "Error handling",
  "Performance under load",
];
```

## 📊 Current Status

| Flow              | Status        | Test Coverage |
| ----------------- | ------------- | ------------- |
| Gallery-to-Editor | 100% Complete | ✅ Full       |
| Node Management   | 70% Complete  | Partial       |
| Workflow Creation | 20% Complete  | None          |
| Save/Load         | 0% Complete   | None          |
| Canvas Navigation | 90% Complete  | Partial       |

## 🎯 Definition of "Working"

A feature is considered **working** when:

1. User can complete the task without errors
2. UI provides appropriate feedback
3. State persists correctly
4. Performance is acceptable (<100ms response)
5. No console errors occur

## 🚨 Critical Failures

These scenarios should ALWAYS fail smoke tests:

- Cannot navigate from gallery to editor
- Blueprint YAML fails to load
- Nodes don't appear after blueprint load
- Cannot add nodes to canvas
- Cannot select nodes
- Canvas doesn't render
- Store loses state
- Keyboard shortcuts don't work
- Application crashes

---

**Last Updated**: 2025-09-14
**Next Review**: When implementing connection system

## 🧪 Smoke Test Files

- **`gallery-editor-flow.spec.ts`** - Gallery-to-Editor flow (NEW)
- **`smoke.spec.ts`** - Basic page loads and navigation
- **`editor-core-flows.spec.ts`** - Node management and canvas operations

## 🏃‍♂️ Pre-Commit Requirements

All smoke tests must pass before commits are allowed. These tests ensure critical user flows remain functional.
